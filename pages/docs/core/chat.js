import React from 'react'
import DocsPageWithNav from './../../../pageClasses/docsPageWithSideNav.js'
import { Row, Col } from 'react-bootstrap'
import DocsPage from './../../../components/layouts/docsPage.js'

import Code from './../../../components/code.js'

const RoomStatus =
`{
  room: "myRoom",
  membersCount: 2,
  members: {
    aaa: {id: "aaa", joinedAt: 123456789 },
    bbb: {id: "bbb", joinedAt: 123456789 },
  }
}`

export default class extends DocsPageWithNav {
  constructor (props) {
    super(props)

    this.state = {
      titleSection: {
        title: 'Core: Chat',
        icon: '/static/images/chat.svg'
      },
      sections: {
        'general': 'General',
        'methods': 'Methods',
        'middleware': 'Middleware',
        'specific-clients': 'Chatting to specific clients',
        'client-use': 'Client Use'
      },
      links: [
        {link: '/docs/core/file-server', title: '» Core: File Server'},
        {link: '/docs/core/cache', title: '« Core: Cache'}
      ]
    }
  }

  render () {
    return (
      <DocsPage sideNav={this.state.sections} titleSection={this.state.titleSection} links={this.state.links} currentSection={this.state.currentSection}>
        <Row>
          <Col md={12}>
            { this.section('general',
              <div>
                <p>ActionHero ships with a chat framework which may be used by all persistent connections (<code>socket</code> and <code>websocket</code>).  There are methods to create and manage chat rooms and control the users in those rooms.  Chat does not have to be for peer-to-peer communication, and is a metaphor used for many things, including game state in MMOs.</p>
                <p>Clients themselves interact with rooms via <code>verbs</code>.  Verbs are short-form commands that will attempt to modify the connection's state, either joining or leaving a room.  Clients can be in many rooms at once.</p>
                <p>Relevant chat verbs are:</p>

                <ul>
                  <li><code>roomAdd</code></li>
                  <li><code>roomLeave</code></li>
                  <li><code>roomView</code></li>
                  <li><code>say</code></li>
                </ul>

                <p>The special verb for persistent connections <code>say</code> makes use of <code>api.chatRoom.broadcast</code> to tell a message to all other users in the room, IE: <code>say myRoom Hello World</code> from a socket client or <code>client.say(&quot;myRoom&quot;, 'Hello World&quot;)</code> for a websocket.</p>
                <p>Chat on multiple actionHero nodes relies on redis for both chat (pub/sub) and a key store defined by <code>api.config.redis</code>. Note that if you elect to use fakeredis, you will be using an in-memory redis server rather than a real redis process, which does not work to share data across nodes.  The redis store and the key store don't need to be the same instance of redis, but they do need to be the same for all ActionHero servers you are running in parallel.  This is how ActionHero scales the chat features.</p>
                <p>There is no limit to the number of rooms which can be created, but keep in mind that each room stores information in redis, and there load created for each connection.</p>
              </div>
            )}

            { this.section('methods',
              <div>
                <p>These methods are to be used within your server (perhaps an action or initializer).  They are not exposed directly to clients, but they can be within an action.</p>

                <h3><code>{'api.chatRoom.broadcast(connection, room, message, callback)'}</code></h3>

                <ul>
                  <li>tell a message to all members in a room.</li>
                  <li>connection can either be a real connection (A message coming from a client), or a mockConnection.  A mockConnection at the very least has the form <code>{`room: "someOtherRoom"`}</code>.  mockConnections without an id will be assigned the id of 0</li>
                  <li>The <code>context</code> of messages sent with <code>api.chatRoom.broadcast</code> always be <code>user</code> to differentiate these responses from a <code>response</code> to a request</li>
                </ul>

                <h3><code>api.chatRoom.list(callback)</code></h3>

                <ul>
                  <li>callback will return (error, [rooms])</li>
                </ul>

                <h3><code>api.chatRoom.add(room, callback)</code></h3>

                <ul>
                  <li>callback will return 1 if you created the room, 0 if it already existed</li>
                </ul>

                <h3><code>api.chatRoom.destroy(room, callback)</code></h3>

                <ul>
                  <li>callback is empty</li>
                </ul>

                <h3><code>api.chatRoom.exists(room, callback)</code></h3>

                <ul>
                  <li>callback returns (error, found); found is a boolean</li>
                </ul>

                <h3><code>api.chatRoom.roomStatus(room, callback)</code></h3>

                <ul>
                  <li>callback returns (error, details); details is a hash containing room information</li>
                  <li>details of the form:</li>
                </ul>

                <Code>{RoomStatus}</Code>

                <h3><code>api.chatRoom.addMember(connectionId, room, callback)</code></h3>

                <ul>
                  <li>callback is of the form (error, wasAdded)</li>
                  <li>you can add connections from this or any other server in the cluster</li>
                </ul>

                <h3><code>api.chatRoom.removeMember(connectionId, room, callback)</code></h3>

                <ul>
                  <li>callback is of the form (error, wasRemoved)</li>
                  <li>you can remove connections from this or any other server in the cluster</li>
                </ul>

                <h3><code>api.chatRoom.generateMemberDetails( connection )</code></h3>

                <ul>
                  <li>defines what is stored from the connection object in the member data</li>
                  <li>default is <code>id: connection.id</code></li>
                  <li>other data that is stored by default is <code>host: api.id</code> and <code>joinedAt: new Date().getTime()</code></li>
                  <li>override the entire method to store custom data <em>that is on the connection</em></li>
                </ul>

                <h3><code>api.chatRoom.sanitizeMemberDetails( memberData )</code></h3>

                <ul>
                  <li>Defines what is pulled out of the member data when returning roomStatus</li>
                  <li>Defaults to <code>joinedAt : memberData.joinedAt</code></li>
                  <li>After method call, always filled with <code>id</code>, based on the <code>connection.id</code> used to store the data</li>
                  <li>Override the entire method to use custom data as defined in <code>api.chatRoom.generateMemberDetails</code></li>
                </ul>

                <h3><code>api.chatRoom.generateMessagePayload( message )</code></h3>

                <ul>
                  <li>Defiens how messages from clients are sanitized</li>
                  <li>Override the entire method to use custom data as defined in <code>api.chatRoom.generateMessagePayload</code></li>
                </ul>
              </div>
            )}

            { this.section('middleware',
              <div>
                <p>There are 4 types of middleware you can install for the chat system: <code>say</code>, <code>onSayReceive</code>, <code>join</code>, and <code>leave</code>.  You can learn more about <a href='/docs/core/middleware'>chat middleware in the middleware section of this site</a></p>
              </div>
            )}

            { this.section('specific-clients',
              <div>
                <p>Every connection object also has a <code>connection.sendMessage(message)</code> method which you can call directly from the server.</p>
              </div>
            )}

            { this.section('client-use',
              <div>
                <p>The details of communicating within a chat room are up to each individual server (see <a href='/docs/servers/websocket'>websocket</a> or <a href='/docs/servers/socket'>socket</a>), but the same principals apply:</p>
                <ul>
                  <li>Client will join a room (<code>client.roomAdd(room)</code>).</li>
                  <li>Once in the room, clients can send messages (which are strings) to everyone else in the room via <code>say</code>, ie: <code>{`client.say('room', Hello World')`}</code></li>
                  <li>Once a client is in a room, they will revive messages from other members of the room as events.  For example, catching say events from the websocket client looks like <code>{`client.on('say', function(message){ console.log(message); })`}</code>.  You can inspect <code>message.room</code> if you are in more than one room.
                    <ul>
                      <li>The payload of a message will contain the room, sender, and the message body: <code>{`{message: &quot;Hello World&quot;, room: &quot;SecretRoom&quot;, from: &quot;7d419af9-accf-40ac-8d78-9281591dd59e&quot;, context: &quot;user&quot;, sentAt: 1399437579346}`}</code></li>
                    </ul>
                  </li>
                </ul>

                <p>If you want to create an authenticated room, there are 2 steps:</p>

                <ul>
                  <li>First, create an action which modifies some property eitehr on the connection object it self, or stores permissions to a database.</li>
                  <li>Then, create a <code>joinCallback</code>-style middleware which cheks these values.</li>
                </ul>
              </div>
            )}
          </Col>
        </Row>
      </DocsPage>
    )
  }
}
