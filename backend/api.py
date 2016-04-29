import webapp2

from backend.channels import create_channel

class ChannelHandler(webapp2.RequestHandler):
    """
    Handler for /api/channels/<channelId> requests

    Returns a channel token
    """
    def get(self, channelId):
        self.handleRequest(channelId)

    def post(self, channelId):
        self.handleRequest(channelId)

    def handleRequest(self, channelId):
        token = create_channel(channelId, float(self.request.params["duration"]))
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.write(token)


class ChannelMessageHandler(webapp2.RequestHandler):
    """
    Handler for /api/channels/<channelId>/message requests

    Sends a message on channelId.
    """
    def get(self, channelId):
        self.handleRequest(channelId)

    def post(self, channelId):
        self.handleRequest(channelId)

    def handleRequest(self, channelId):
        """
        GET/POST /api/channels/<channelId>/message

        Send a message to channelId.

        url params:
          message: Contents of message
        """
        if "message" in self.request.params:
            message = self.request.params["message"]
            print(channelId, message)

app = webapp2.WSGIApplication([
    webapp2.Route('/api/channels/<channelId>', ChannelHandler),
    webapp2.Route('/api/channels/<channelId>/message', ChannelMessageHandler)
])
