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
	console.log(ctx.request.body);
	ctx.response.body = 'OK!';
});

app.use((ctx, next) => {
	if (ctx.request.method !== 'POST') {
		next();
		return;
	}
	
	ctx.response.set('Access-Control-Allow-Origin', '*');
	console.log(ctx.headers);
	console.log(ctx.request.query);
	console.log(ctx.request.body);
	
	let newTicketFull = JSON.parse(ctx.request.body);
	newTicketFull.id = uuid.v4();
	newTicketFull.created = getDateTime();
	let { description, ...fieldTicketNotFull } = newTicketFull;
	ticketFull.push(newTicketFull);
	ticket.push(fieldTicketNotFull);
	console.log(ticketFull);
	console.log(ticket);
	ctx.response.body = newTicketFull;
	//ctx.body = `Request Body: ${JSON.stringify(ctx.request.body)}`;
	next();
});

app.use(async (ctx, next) => {
    const { method, id } = ctx.request.query;
	ctx.response.set('Access-Control-Allow-Origin', '*');

    switch (method) {
        case 'allTickets':
            ctx.response.body = ticket;
			console.log(ctx.request.query);
            return;
		case 'ticketById':
		    const index = ticketFull.findIndex(n => n.id === ctx.request.query.id);
			if (index !== -1) {
				ticketFull.splice(index, 1);
				ticket.splice(index, 1);
            }
			//ticketFull = ticketFull.filter((i, index) => i.id != ctx.request.query.id);
			//ticket = ticket.filter((i, index) => i.id != ctx.request.query.id);
			//console.log(someTicket);
			//console.log(ctx.request.query);
		    ctx.response.body = "Запись удалена";
			return;
		case 'ticketStatus':
		    const indexStatus = ticketFull.findIndex(n => n.id === ctx.request.query.id);
			if (indexStatus !== -1) {
				console.log(ticketFull[indexStatus].status);
				ticketFull[indexStatus].status = true;
				ticket[indexStatus].status = true;
				console.log(ticketFull[indexStatus].status);
            }
			//ticketFull = ticketFull.filter((i, index) => i.id != ctx.request.query.id);
			//ticket = ticket.filter((i, index) => i.id != ctx.request.query.id);
			//console.log(someTicket);
			console.log(ctx.request.query);
		    ctx.response.body = "Статус изменен";
			return;		    
    }
	next();
});

const server = http.createServer(app.callback());
 
const port = 7020;
 
server.listen(port, (err) => {
	 if (err) {
		 console.log(err);
		 return;
	 }
	 console.log('Сервер запущен, порт: ' + port);
})

/* app.use((ctx, next) => {
	if (ctx.request.method !== 'POST') {
		next();
		return;
	}
	console.log(ctx.headers);
	console.log(ctx.request.query);
	console.log(ctx.request.body);
	ctx.response.set('Access-Control-Allow-Origin', '*');
	ctx.response.body = 'OK!';
	//ctx.body = `Request Body: ${JSON.stringify(ctx.request.body)}`;
	next();
}); */

/* app.use((ctx, next) => {
	if (ctx.request.method !== 'GET') {
		next();
		return;
	}
	ctx.response.set('Access-Control-Allow-Origin', '*');
	console.log(ctx.request.query);
	const { method, id } = ctx.request.query;
	console.log(method, id);

	ctx.response.body = ticket;

	next();
}); */

//
//let ticketId = uuid.v4();