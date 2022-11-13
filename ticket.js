const http = require('http');
const Koa = require('koa');
const koaStatic = require('koa-static');
const { koaBody } = require('koa-body');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
 
const app = new Koa();

const public = path.join(__dirname, '\\public');
app.use(koaStatic(public));

const ticket = [];

const ticketFull = [];

function getDateTime() {
	let timestamp = new Date();
	let date = timestamp.getDate();
	let month = timestamp.getMonth();
	let year = timestamp.getFullYear();
	let hours = timestamp.getHours();
	let minutes = timestamp.getMinutes();
	
    return `${date}.${month + 1}.${year} ${hours}:${minutes}`;
};

app.use(koaBody({
	urlencoded: true,
	multipart: true,
}));

app.use((ctx, next) => {
	if (ctx.request.method !== 'OPTIONS') {
		next();
		return;
		
	}
	ctx.response.set('Access-Control-Allow-Origin', '*');
	ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');
	ctx.response.status = 204;
	ctx.response.body = 'OK!';
});

app.use((ctx, next) => {
	if (ctx.request.method !== 'POST') {
		next();
		return;
	}
	ctx.response.set('Access-Control-Allow-Origin', '*');
	if (ctx.request.query.method === 'changeTicket') {
		console.log(ctx.request.body);
		ctx.response.body = newTicketFull;
	} else {
		let newTicketFull = JSON.parse(ctx.request.body);
		newTicketFull.id = uuid.v4();
		newTicketFull.created = getDateTime();
		let { description, ...fieldTicketNotFull } = newTicketFull;
		ticketFull.push(newTicketFull);
		ticket.push(fieldTicketNotFull);
		ctx.response.body = newTicketFull;		
	}
	next();
});

app.use(async (ctx, next) => {
    const { method, id } = ctx.request.query;
	ctx.response.set('Access-Control-Allow-Origin', '*');

    switch (method) {
      
		case 'allTickets':
            ctx.response.body = ticket;
            
			return;
		
		case 'ticketById':
		    const index = ticketFull.findIndex(n => n.id === ctx.request.query.id);
			if (index !== -1) {
				ticketFull.splice(index, 1);
				ticket.splice(index, 1);
            }		
		    ctx.response.body = "Запись удалена";
			
			return;
		
		case 'ticketStatus':
		    const indexStatus = ticketFull.findIndex(n => n.id === ctx.request.query.id);
			if (indexStatus !== -1) {
				ticketFull[indexStatus].status = true;
				ticket[indexStatus].status = true;
            }
		
		case 'ticketDescription':
		    const indexDescription = ticketFull.findIndex(n => n.id === ctx.request.query.id);
			ctx.response.body = ticketFull[indexDescription].description;

			return;	
    }
	next();
});

const server = http.createServer(app.callback());
 
const port = 7010;
 
server.listen(port, (err) => {
	 if (err) {
		 console.log(err);
		 return;
	 }
	 console.log('Сервер запущен, порт: ' + port);
})
