import cv2
import numpy as np

dwarves = cv2.imread("imgs/Dwarf Fortress/raw/graphics/Vordak/dwarves.png", cv2.IMREAD_UNCHANGED)
misc = cv2.imread("imgs/Dwarf Fortress/data/art/_Meph_32x32.png", cv2.IMREAD_UNCHANGED)
dec = cv2.imread("imgs/Dwarf Fortress/data/art/_Meph_decorations.png", cv2.IMREAD_UNCHANGED)
#dec_2 = cv2.imread("imgs/Dwarf Fortress/data/art/_Meph_decorations_2.png", cv2.IMREAD_UNCHANGED)
water = cv2.imread("imgs/water.png", cv2.IMREAD_UNCHANGED)
amphibians = cv2.imread("imgs/Dwarf Fortress/raw/graphics/amphibians.png", cv2.IMREAD_UNCHANGED)
domestic = cv2.imread("imgs/Dwarf Fortress/raw/graphics/domestic.png", cv2.IMREAD_UNCHANGED)
constructions = cv2.imread("imgs/Dwarf Fortress/data/art/_Meph_constructions.png", cv2.IMREAD_UNCHANGED)
kobolds = cv2.imread("imgs/Dwarf Fortress/raw/graphics/Vordak/kobolds.png", cv2.IMREAD_UNCHANGED)
furniture = cv2.imread("imgs/Dwarf Fortress/data/art/_Meph_furniture.png", cv2.IMREAD_UNCHANGED)

w = 32
def im_coords(im, x0, y0):
    x1, y1 = x0 + 1, y0 + 1
    return im[x0*w:x1*w, y0*w:y1*w]

player = misc[8*w:9*w, 12*w:13*w]
grass = misc[1*w:2*w, 7*w:8*w]
shrub = misc[4*w:5*w, 6*w:7*w]
tree = misc[-7*w:-6*w, 12*w:13*w]
#water_tiles = dec_2[-2*w:-1*w, 10*w:11*w]
water = water[1*w:2*w, 1*w:2*w]
frogman = amphibians[0*w:1*w, 0*w:1*w]
dog = domestic[0*2:1*w, 0*w:1*w]
small_cow = im_coords(domestic, 1, 5)
wall = im_coords(constructions, 2, 12)
goblin = im_coords(kobolds, 0, 0)
door = im_coords(furniture, 2, 15)

tiles = (player, grass, shrub, tree, water, frogman, dog, small_cow, wall, goblin, door)
v = np.concatenate(tiles, axis=1)

cv2.imwrite('tileset.png', v)
