import React from 'react'
import DocsPageWithNav from './../../../pageClasses/docsPageWithSideNav.js'
import { Row, Col } from 'react-bootstrap'
import DocsPage from './../../../components/layouts/docsPage.js'
import Link from 'next/link'

import Code from './../../../components/code.js'

const Overview =
`> Client **Connects**
#     connection middleware, \`create\` hook
> Client requests an **action**
#     action middleware, \`preProcessor\` hook
#     action middleware, \`postProcessor\` hook
> Client **joins a room**
#     chat middleware, \`join\` hook
> Client **says a message** in a room
#     chat middleware, \`say\` hook
#     chat middleware, \`onSayReceive\` hook
> Client requests a **disconnect** (quit)
#     chat middleware, \`leave\` hook
#     connection middleware, \`destroy\` hook
> Client executes a **task**
#     task middleware, \`preProcessor\` hook
#     task middleware, \`postProcessor\` hook
`

const ActionMiddleare =
`var middleware = {
  name: 'userId checker',
  global: false,
  priority: 1000,
  preProcessor: function(data, next){
    if(!data.params.userId){
      next(new Error('All actions require a userId') );
    }else{
      next();
    }
  },
  postProcessor: function(data, next){
    if(data.thing.stuff == false){
      data.toRender = false;
    }
    next(error);
  }
}

api.actions.addMiddleware(middleware);`

const TheDataObject =
`data = {
  connection: {},
  action: 'randomNumber',
  toProcess: true,
  toRender: true,
  messageCount: 1,
  params: { action: 'randomNumber', apiVersion: 1 },
  missingParams: [],
  validatorErrors: [],
  actionStartTime: 1429531553417,
  actionTemplate: {}, // the actual object action definition
  working: true,
  response: {},
  duration: null,
  actionStatus: null,
}`

const ConnectionMiddleware =
`var connectionMiddleware = {
  name: 'connection middleware',
  priority: 1000,
  create: function(connection){
    // do stuff
  },
  destroy: function(connection){
    // do stuff
  }
};

api.connections.addMiddleware(connectionMiddleware);`

const ChatMiddleware =
`var chatMiddleware = {
  name: 'chat middleware',
  priority: 1000,
  join: function(connection, room, callback){
    // announce all connections entering a room
    api.chatRoom.broadcast({}, room, 'I have joined the room: ' + connection.id, callback);
  },
  leave: function(connection, room, callback){
    // announce all connections leaving a room
    api.chatRoom.broadcast({}, room, 'I have left the room: ' + connection.id, callback);
  },
  /**
   * Will be executed once per client connection before delivering the message.
   */
  say: function(connection, room, messagePayload, callback){
    // do stuff
    api.log(messagePayload);
    callback(null, messagePayload);
  },
  /**
   * Will be executed only once, when the message is sent to the server.
   */
  onSayReceive: function(connection, room, messagePayload, callback){
    // do stuff
    api.log(messagePayload);
    callback(null, messagePayload);
  }
};

api.chatRoom.addMiddleware(chatMiddleware);`

const ChatMiddlewareNotes =
`// in this example no one will be able to join any room, and the \`say\` callback will never be invoked.

api.chatRoom.addMiddleware({
  name: 'blocking chat middleware',
  join: function(connection, room, callback){
    callback(new Error('blocked from joining the room'));
  }),
  say: function(connection, room, messagePayload, callback){
    api.chatRoom.broadcast({}, room, 'I have entered the room: ' + connection.id, function(e){
      callback();
    });
  },
});`

const TaskMiddleware =
`'use strict';

module.exports = {
  loadPriority:  1000,
  initialize: function(api, next){
    api.taskTimer = {
      middleware: {
        name: 'timer',
        global: true,
        priority: 90,
        preProcessor: function(next){
          var worker = this.worker;
          worker.start = process.hrtime();
          next();
        },
        postProcessor: function(next){
          var worker = this.worker;
          var elapsed = process.hrtime(worker.start);
          var seconds = elapsed[0];
          var millis = elapsed[1] / 1000000;
          api.log(worker.job.class + ' done in ' + seconds + ' s and ' + millis + ' ms.', 'info');
          next();
        },
        preEnqueue: function(next){
          var params = this.args[0];
          //Validate params
          next(null, true); //callback is in form cb(error, toRun)
        },
        postEnqueue: function(next){
          api.log("Task successfully enqueued!");
          next();
        }
      }
    };

    api.tasks.addMiddleware(api.taskTimer.middleware);
  }
};`

export default class extends DocsPageWithNav {
  constructor (props) {
    super(props)

    this.state = {
      titleSection: {
        title: 'Core: Middleware',
        icon: '/static/images/api-first-development.svg'
      },
      sections: {
        'overview': 'Overview',
        'action-request-flow': 'Action Request Flow',
        'action-middleware': 'Action Middleware',
        'connection-middleware': 'Connection Middleware',
        'chat-middleware': 'Chat Middleware',
        'task-request-flow': 'Task Request Flow',
        'task-middleware': 'Task Middleware'
      },
      links: [
        {link: '/docs/core/initializers', title: '» Core: Initializers'},
        {link: '/docs/core/tasks', title: '« Core: Tasks'}
      ]
    }
  }

  render () {
    return (
      <DocsPage sideNav={this.state.sections} titleSection={this.state.titleSection} links={this.state.links} currentSection={this.state.currentSection}>
        <Row>
          <Col md={12}>
            { this.section('overview',
              <div>
                <p>There are 4 types of middleware in ActionHero:</p>

                <ul>
                  <li><strong>Action</strong></li>
                  <li><strong>Connection</strong></li>
                  <li><strong>Chat</strong></li>
                  <li><strong>Task</strong></li>
                </ul>

                <Code language='bash'>{Overview}</Code>

                <p>Each type of middleware is distinct from the others, and operates on distinct parts of a client's lifecycle.  For a logical example, please inspect the following connection lifecycle:</p>
              </div>
            )}

            { this.section('action-request-flow',
              <div>
                <img width='100%' src='/static/images/connection_flow_actions.png' />
              </div>
            )}

            { this.section('action-middleware',
              <div>
                <Code>{ActionMiddleare}</Code>
                <p>ActionHero provides hooks for you to execute custom code both before and after the execution of all or some actions.  This is a great place to write authentication logic or custom loggers.</p>
                <p>Action middleware requires a <code>name</code> and at least one of <code>preProcessor</code> or <code>postProcessor</code>.  Middleware can be <code>global</code>, or you can choose to apply each middleware to an action specifically via <code>action.middleware = []</code> in the action's definition.  You supply a list of middleware names, like <code>action.middleware = ['userId checker']</code> in the example above.</p>
                <p>Each processor is passed <code>data</code> and the callback <code>next</code>.  Just like within actions, you can modify the <code>data</code> object to add to <code>data.response</code> to create a response to the client.  If you pass <code>error</code> to the callback <code>next</code>, that error will be returned to the client.  If a <code>preProcessor</code> has an error, the action will never be called.</p>
                <p>The priority of a middleware orders it with all other middleware which might fire for an action.  Lower numbers happen first.  If you do not provide a priority, the default from <code>api.config.general.defaultProcessorPriority</code> will be used</p>

                <h3>The Data Object</h3>
                <p><code>data</code> contains the same information as would be passed to an action:</p>
                <Code>{TheDataObject}</Code>
              </div>
            )}

            { this.section('connection-middleware',
              <div>
                <Code>{ConnectionMiddleware}</Code>
                <p>Like the action middleware above, you can also create middleware to react to the creation or destruction of all connections.  Unlike action middleware, connection middleware is non-blocking and connection logic will continue as normal regardless of what you do in this type of middleware.</p>
                <p>Keep in mind that some connections persist (webSocket, socket) and some only exist for the duration of a single request (web).  You will likely want to inspect <code>connection.type</code> in this middleware.  Again, if you do not provide a priority, the default from <code>api.config.general.defaultProcessorPriority</code> will be used.</p>
                <p>Any modification made to the connection at this stage may happen either before or after an action, and may or may not persist to the connection depending on how the server is implemented.</p>
              </div>
            )}

            { this.section('chat-middleware',
              <div>
                <Code>{ChatMiddleware}</Code>
                <p>The last type of middleware is used to act when a connection joins, leaves, or communicates within a chat room. We have 4 types of middleware for each step: <code>say</code>, <code>onSayReceive</code>, <code>join</code>, and <code>leave</code>.</p>
                <p>Priority is optional in all cases, but can be used to order your middleware.  If an error is returned in any of these methods, it will be returned to the user, and the action/verb/message will not be sent.</p>
                <p>More detail and nuance on chat middleware can be found in the <Link href='/docs/core/chat'><a>chat section</a></Link></p>

                <h3>Chat Midleware Notes</h3>

                <ul>
                  <li>In the example above, I want to announce the member joining the room, but he has not yet been added to the room, as the callback chain is still firing.  If the connection itself were to make the broadcast, it would fail because the connection is not in the room.  Instead, an empty <code>{}</code> connection is used to proxy the message coming from the 'system'</li>
                  <li>Only the <code>sayCallbacks</code> have a second return value on the callback, <code>messagePayload</code>.  This allows you to modify the message being sent to your clients.</li>
                  <li><code>messagePayload</code> will be modified and and passed on to all <code>addSayCallback</code> middlewares inline, so you can append and modify it as you go</li>
                  <li>If you have a number of callbacks (<code>say</code>, <code>onSayReceive</code>, <code>join</code> or <code>leave</code>), the priority maters, and you can block subsequent methods from firing by returning an error to the callback.</li>
                  <li><code>sayCallbacks</code> are executed once per client connection. This makes it suitable for customizing the message based on the individual client.</li>
                  <li><code>onSayReceiveCallbacks</code> are executed only once, when the message is sent to the server.</li>
                </ul>

                <Code>{ChatMiddlewareNotes}</Code>

                <p>If a <code>say</code> is blocked/errored, the message will simply not be delivered to the client.  If a <code>join</code> or <code>leave</code> is blocked/errored, the verb or method used to invoke the call will be returned that error.</p>
              </div>
            )}

            { this.section('task-request-flow',
              <div>
                <img width='100%' src='/static/images/connection_flow_tasks.png' />
              </div>
            )}

            { this.section('task-middleware',
              <div>
                <p>Task middleware is implemented as a thin wrapper around Node Resque plugins and currently exposes the <code>before_perform</code>, <code>after_perform</code>, <code>before_enqueue</code>, and <code>after_enqueue</code> functions of Resque plugins through <code>preProcessor</code>, <code>postProcessor</code>,
                <code>preEnqueue</code>, and <code>postEnqueue</code> methods. Each middleware requires a <code>name</code> and at least one {`function`}. In addition, a middleware can be global, in which case it also requires a <code>priority</code>.</p>

                <p>In the <code>preProcessor</code>, you can access the original task <code>params</code> through <code>this.args[0]</code>.
                In the <code>postProcessor</code>, you can access the task result at <code>this.worker.result</code>.
                In the <code>preEnqueue</code> and <code>postEnqueue</code> you can access the task <code>params</code> through <code>this.args[0]</code>. If you wish to prevent a task from being enqueued
                using the <code>preEnqueue</code> middleware you must explicitly set the <code>toRun</code> value to <code>false</code> in the callback.
                Because the task middleware is executed by Resque <code>this</code> is an instance of a Resque Worker and contains a number of
                other elements which may be useful in a middleware.</p>

                <h3>Task Middleware Example</h3>

                <p>The following example is a simplistic implementation of a task execution timer middleware.</p>
                <Code>{TaskMiddleware}</Code>
              </div>
            )}
          </Col>
        </Row>
      </DocsPage>
    )
  }
}
