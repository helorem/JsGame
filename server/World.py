import define

class World:
    instance = None

    def __init__(self):
        self.tiles = None
        self.w = -1
        self.h = -1

    @staticmethod
    def get():
        if World.instance is None:
            World.instance = World()
        return World.instance

    def create(self, w, h):
        if self.tiles is None:
            self.w = w
            self.h = h
            self.tiles = []

            for i in xrange(0, self.h * self.w):
                self.tiles.append(1)

    def get_world_msg(self):
        return [define.SET_TILE, self.w, self.h] + self.tiles
