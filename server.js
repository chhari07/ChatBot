/**
 * Created by Christian Bartram on 6/8/17.
 */
'use strict';

global.navigator = { userAgent: 'all' };

const path = require('path');
const http =  require('http');
const Express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const { Wit } = require('node-wit');
const SocketIO =  require('socket.io');


// initialize the server and configure support for ejs templates
const app = new Express();
const server = http.Server(app);
let io = new SocketIO(server);


let authenticated = false;

const client = new Wit({
    accessToken: "WIPCNZGMJ5KSPEHCQQUAEVYP55MXIIX2",
});

// define the folder that will be used for static assets
app.use(Express.static(path.join(__dirname, 'static')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


io.on('connection', (socket) => {
   socket.on('message', (data) => {

       //Invoke Wit.AI NLP Engine
       client.message(data.text, {})
           .then((data) => {

               //Find providers and notify client
               if(data.entities.hasOwnProperty('intent')) {
                   switch(data.entities.intent[0].value) {
                       case 'find_providers':
                           socket.emit('message', {
                               id: 1,
                               user: 0,
                               requireAuth: false,
                               auth: authenticated,
                               msg: `You have 5 Providers near you the closest one is 3.2 miles from you, I've marked their location in your links!`,
                               type: 'message',
                               link: 'http://maps.apple.com/?q=Doctor',
                               subject: 'Care Providers',
                               label: 'danger',
                               timestamp: moment().format('h:mm a')
                           });
                           break;
                       case 'deductible_info':
                           socket.emit('message', {
                               id: 2,
                               user: 0,
                               requireAuth: true,
                               auth: authenticated,
                               msg: 'You have the Premium plan it has a $500 deductible and lots of great healthy benefits.',
                               type: 'message',
                               link: null,
                               subject: null,
                               label: null,
                               timestamp: moment().format('h:mm a')
                           });
                           break;
                       case 'insurance_purchase':
                           socket.emit('message', {
                               id: 3,
                               user: 0,
                               requireAuth:false,
                               auth: authenticated,
                               msg: 'Awesome! I can recommend the BlueSelect or BlueOptions plans for you for only $226 and $310 per month respectively!',
                               type: 'message',
                               link: 'https://consumer.websales.floridablue.com/cws/shopping/info',
                               subject: 'Insurance Purchase Info',
                               label: 'primary2',
                               timestamp: moment().format('h:mm a')
                           });
                           break;
                       case 'test':
                           socket.emit('message', {
                               id: 4,
                               user: 0,
                               requireAuth:false,
                               auth: authenticated,
                               msg: 'I read you loud and clear! What can I assist you with today?',
                               type: 'message',
                               link: null,
                               subject: null,
                               label: null,
                               timestamp: moment().format('h:mm a')
                           });
                           break;
                       case 'greeting':
                           socket.emit('message', {
                               id: 5,
                               user: 0,
                               requireAuth:false,
                               auth: authenticated,
                               msg: 'Hello! How can I help you today?',
                               type: 'message',
                               link: null,
                               subject: null,
                               label: null,
                               timestamp: moment().format('h:mm a')
                           });
                           break;
                       case 'bye':
                           socket.emit('message', {
                               id: 6,
                               user: 0,
                               requireAuth:false,
                               auth: authenticated,
                               msg: 'Glad I could help, have a fantastic rest of your day!',
                               type: 'message',
                               link: null,
                               subject: null,
                               label: null,
                               timestamp: moment().format('h:mm a')
                           });
                           break;
                       case 'help':
                           socket.emit('message', {
                               id: 7,
                               user: 0,
                               requireAuth:false,
                               auth: authenticated,
                               msg: 'What can I help you with? I can help with things like Insurance Purchases, Deductible information, and Provider data.',
                               type: 'message',
                               link: null,
                               subject: null,
                               label: null,
                               timestamp: moment().format('h:mm a')
                           });
                           break;
                       case 'personal_inquiry':
                           socket.emit('message', {
                               id: 8,
                               user: 0,
                               requireAuth:false,
                               auth: authenticated,
                               msg: 'Im doing quite well thanks for asking! How are you?',
                               type: 'message',
                               link: null,
                               subject: null,
                               label: null,
                               timestamp: moment().format('h:mm a')
                           });
                           break;

                       case 'auth':
                           //TODO AUTHENTICATE USER
                           console.log(data);
                           let birthdate = data.entities.datetime[0];

                           //TODO just comparing it to JSON for the prototype

                           authenticated = true;

                           socket.emit('message', {
                               id: 9,
                               user: 0,
                               requireAuth:false,
                               auth: authenticated,
                               msg: 'Thank you for authenticating! What can I help you with',
                               type: 'message',
                               link: null,
                               subject: null,
                               label: null,
                               timestamp: moment().format('h:mm a')
                           });
                           break;

                       default:
                           socket.emit('message', {
                               id: 10,
                               user: 0,
                               requireAuth:false,
                               auth: authenticated,
                               msg: 'Yikes not really sure what to do',
                               type: 'message',
                               link: null,
                               subject: null,
                               label: null,
                               timestamp: moment().format('h:mm a')
                           });
                   }
               } else {
                   socket.emit('message', {
                       user: 0,
                       requireAuth:false,
                       auth: authenticated,
                       msg: 'Sorry im not sure what to do with your request. Try asking something like "Find my provider" or "Help me find a plan"',
                       type: 'message',
                       link: null,
                       subject: null,
                       label: null,
                       timestamp: moment().format('h:mm a')
                   })
               }
           }).catch(() => {

           socket.emit('message', {
               user: 2,
               requireAuth: false,
               auth: authenticated,
               msg: 'Failed to Connect',
               type: 'event',
               link: null,
               subject: null,
               label: null,
               timestamp: moment().format('h:mm a')
           })
       });
   });

});

// universal routing and rendering
app.get('*', (req, res) => {

});

// start the server
const port = process.env.PORT || 3001;
const env = process.env.NODE_ENV || 'production';

server.listen(port, err => {
    if (err) {
        return console.error(err);
    }
    console.info(`Server running on http://localhost:${port} [${env}]`);
});