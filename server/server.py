import threading
import SimpleWebSocketServer
from World import World
import define

class Client(SimpleWebSocketServer.WebSocket):

    def handleMessage(self):
        pass

    def handleConnected(self):
        Server.get().add_client(self)
        print self.address, 'connected'
        self.send([define.CONNECTED])
        self.send(World.get().get_world_msg())

    def handleClose(self):
        print self.address, 'closed'
        self.server.remove_client(self)

    def send(self, data):
        self.sendMessage(bytearray(data))

class Server:
    instance = None

    def __init__(self):
        self.clients = []
        self.ws_server = None
        self.thread = None

    @staticmethod
    def get():
        if Server.instance is None:
            Server.instance = Server()
        return Server.instance

    def init(self, host, port):
        self.ws_server = SimpleWebSocketServer.SimpleWebSocketServer(host, port, Client)

    def add_client(self, client):
        self.clients.append(client)
        client.server = self

    def remove_client(self, client):
        self.clients.remove(client)

    def send(self, data):
        for client in self.clients:
            client.send(data)

    def start(self):
        if self.thread:
            self.stop()
        self.thread = threading.Thread(target=self._loop)
        self.thread.start()

    def stop(self):
        if self.thread:
            self.ws_server.close()
            self.thread.join(3)
            self.thread = None

    def _loop(self):
        self.ws_server.serveforever()

if __name__ == "__main__":
    World.get().create(10, 10)

    Server.get().init("127.0.0.1", 8012)
    Server.get().start()
    try:
        import time
        while True:
            time.sleep(1)
    except:
        Server.get().stop()
