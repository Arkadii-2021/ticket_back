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
  
  const getData = {
    'date': timestamp.getDate().toString().length < 2 
            ? timestamp.getDate().toString().padStart(2, '0') 
            : timestamp.getDate(),
    'month': timestamp.getMonth().toString().length < 2
            ? timestamp.getMonth().toString().padStart(2, '0') 
            : timestamp.getMonth(),
    'year': timestamp.getFullYear(),
	  'hours': timestamp.getHours().toString().length < 2
            ? timestamp.getHours().toString().padStart(2, '0') 
            : timestamp.getHours(),
	  'minutes': timestamp.getMinutes().toString().length < 2
            ? timestamp.getMinutes().toString().padStart(2, '0') 
            : timestamp.getMinutes(),
  };
  
  return `${getData.date}.${getData.month + 1}.${getData.year} ${getData.hours}:${getData.minutes}`;
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
      
    let changeTicketFull = JSON.parse(ctx.request.body);
		ticket[ticket.findIndex(item=>item.id == changeTicketFull.id)].name = changeTicketFull.name;
    ticket[ticket.findIndex(item=>item.id == changeTicketFull.id)].status = changeTicketFull.status;
    ticketFull[ticketFull.findIndex(item=>item.id == changeTicketFull.id)].name = changeTicketFull.name;
    ticketFull[ticketFull.findIndex(item=>item.id == changeTicketFull.id)].status = changeTicketFull.status;
    ticketFull[ticketFull.findIndex(item=>item.id == changeTicketFull.id)].description = changeTicketFull.description;
    ticketFull[ticketFull.findIndex(item=>item.id == changeTicketFull.id)].created = getDateTime();
		ctx.response.body = changeTicketFull;
      
	} else if (ctx.request.query.method === 'createTicket') {
		
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
		
	case 'removeTicket':
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
 
const port = 7030;
 
server.listen(port, (err) => {
	if (err) {
	  console.log(err);
		return;
	}
	console.log('Server started in port: ' + port);
});
