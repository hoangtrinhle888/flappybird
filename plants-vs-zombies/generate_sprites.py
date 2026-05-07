#!/usr/bin/env python3
"""
Generate PvZ-style sprites as PNG files using PIL/Pillow.
Each sprite is drawn programmatically to look like the originals.
"""
from PIL import Image, ImageDraw, ImageFont
import math, os

OUT = os.path.dirname(os.path.abspath(__file__)) + '/assets'
os.makedirs(OUT, exist_ok=True)

def save(img, name):
    img.save(f'{OUT}/{name}', 'PNG')
    print(f'  Created {name}')

def circle(draw, cx, cy, r, fill, outline=None, width=1):
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=fill, outline=outline, width=width)

def rect(draw, x, y, w, h, fill, outline=None, width=1):
    draw.rectangle([x, y, x+w, y+h], fill=fill, outline=outline, width=width)

# ========================================
# SUNFLOWER
# ========================================
def make_sunflower():
    img = Image.new('RGBA', (80, 90), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # Stem
    d.line([(40,80),(40,65)], fill=(34,139,34), width=5)
    # Petals
    petal_cols = [(255,215,0),(255,200,0),(255,180,0)]
    for i in range(12):
        angle = math.radians(i * 30)
        px = 40 + 26 * math.cos(angle)
        py = 38 + 26 * math.sin(angle)
        circle(d, int(px), int(py), 9, petal_cols[i%3])
    # Dark center
    circle(d, 40, 38, 16, (80,40,10))
    circle(d, 40, 38, 13, (101,55,20))
    # Dots in center
    for i in range(5):
        for j in range(5):
            dx = i*4 - 8
            dy = j*4 - 8
            if dx*dx + dy*dy < 11*11:
                circle(d, 40+dx, 38+dy, 2, (60,30,5))
    # Eyes
    circle(d, 35, 35, 3, (255,220,150))
    circle(d, 45, 35, 3, (255,220,150))
    circle(d, 35, 35, 1, (0,0,0))
    circle(d, 45, 35, 1, (0,0,0))
    # Smile
    d.arc([32,38,48,46], 0, 180, fill=(0,0,0), width=2)
    # Leaf
    d.polygon([(40,62),(28,55),(38,58)], fill=(34,139,34))
    save(img, 'sunflower.png')

# ========================================
# PEASHOOTER
# ========================================
def make_peashooter():
    img = Image.new('RGBA', (80, 90), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # Stem
    d.line([(30,80),(30,55)], fill=(34,139,34), width=6)
    # Leaf
    d.polygon([(30,62),(15,52),(28,58)], fill=(0,120,0))
    # Head (big green sphere)
    circle(d, 35, 38, 28, (50,180,50))
    circle(d, 35, 38, 26, (80,200,60))
    # Highlight
    circle(d, 27, 30, 8, (150,230,100))
    # Eyes
    circle(d, 28, 34, 5, (255,255,255))
    circle(d, 42, 34, 5, (255,255,255))
    circle(d, 28, 34, 2, (0,0,0))
    circle(d, 42, 34, 2, (0,0,0))
    # Mouth (barrel)
    rect(d, 52, 35, 20, 9, (80,200,60), outline=(0,120,0), width=2)
    rect(d, 65, 37, 10, 5, (50,160,30))
    # Nostril
    circle(d, 35, 42, 4, (30,130,30))
    save(img, 'peashooter.png')

# ========================================
# WALLNUT
# ========================================
def make_wallnut():
    img = Image.new('RGBA', (75, 85), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # Body - walnut shape
    for i in range(5):
        alpha = 200 + i*10
        circle(d, 37, 42, 33-i, (185-i*10, 130-i*5, 50-i*3))
    # Walnut texture lines
    d.arc([15,22,59,62], 200, 340, fill=(120,80,30), width=3)
    d.arc([20,30,54,55], 10, 170, fill=(120,80,30), width=2)
    # Eyes
    circle(d, 28, 38, 6, (255,220,150))
    circle(d, 46, 38, 6, (255,220,150))
    circle(d, 28, 38, 3, (50,30,10))
    circle(d, 46, 38, 3, (50,30,10))
    # Pupils
    circle(d, 29, 37, 1, (0,0,0))
    circle(d, 47, 37, 1, (0,0,0))
    # Mouth
    d.arc([26,44,48,54], 0, 180, fill=(120,80,30), width=3)
    save(img, 'wallnut.png')

# ========================================
# SNOW PEA
# ========================================
def make_snowpea():
    img = Image.new('RGBA', (80, 90), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # Stem
    d.line([(30,80),(30,55)], fill=(34,139,34), width=6)
    # Head - blue-green
    circle(d, 35, 38, 28, (50,170,200))
    circle(d, 35, 38, 26, (80,190,220))
    # Ice crystals
    for i in range(6):
        angle = math.radians(i*60)
        ix = 35 + 18*math.cos(angle)
        iy = 38 + 18*math.sin(angle)
        circle(d, int(ix), int(iy), 5, (180,240,255))
    # Highlight
    circle(d, 27, 30, 8, (180,240,255))
    # Eyes
    circle(d, 28, 34, 5, (255,255,255))
    circle(d, 42, 34, 5, (255,255,255))
    circle(d, 28, 34, 2, (0,100,180))
    circle(d, 42, 34, 2, (0,100,180))
    # Barrel
    rect(d, 52, 35, 20, 9, (60,180,210), outline=(0,100,150), width=2)
    rect(d, 65, 37, 10, 5, (30,140,170))
    save(img, 'snowpea.png')

# ========================================
# CHERRY BOMB
# ========================================
def make_cherrybomb():
    img = Image.new('RGBA', (75, 80), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # Two cherries
    circle(d, 25, 42, 20, (180,0,0))
    circle(d, 25, 42, 18, (220,20,20))
    circle(d, 50, 40, 20, (180,0,0))
    circle(d, 50, 40, 18, (220,20,20))
    # Stems
    d.line([(25,22),(30,12)], fill=(0,120,0), width=3)
    d.line([(50,20),(30,12)], fill=(0,120,0), width=3)
    d.line([(30,12),(30,8)], fill=(0,120,0), width=3)
    # Leaves
    d.polygon([(30,12),(18,8),(25,14)], fill=(0,150,0))
    d.polygon([(30,12),(42,8),(35,14)], fill=(0,150,0))
    # Angry eyes left
    circle(d, 20, 39, 5, (255,255,200))
    circle(d, 30, 39, 5, (255,255,200))
    circle(d, 20, 39, 2, (0,0,0))
    circle(d, 30, 39, 2, (0,0,0))
    d.line([(15,34),(25,37)], fill=(0,0,0), width=2)
    d.line([(35,37),(25,34)], fill=(0,0,0), width=2)
    # Angry eyes right
    circle(d, 45, 37, 5, (255,255,200))
    circle(d, 55, 37, 5, (255,255,200))
    circle(d, 45, 37, 2, (0,0,0))
    circle(d, 55, 37, 2, (0,0,0))
    d.line([(40,32),(50,35)], fill=(0,0,0), width=2)
    d.line([(60,35),(50,32)], fill=(0,0,0), width=2)
    # Fuses
    d.line([(37,22),(37,8),(40,4)], fill=(255,180,0), width=2)
    # Spark
    circle(d, 40, 4, 4, (255,220,0))
    circle(d, 40, 4, 2, (255,100,0))
    save(img, 'cherrybomb.png')

# ========================================
# REPEATER
# ========================================
def make_repeater():
    img = Image.new('RGBA', (85, 90), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # Stem
    d.line([(28,80),(28,55)], fill=(34,139,34), width=6)
    # Head - dark green
    circle(d, 32, 38, 28, (20,140,20))
    circle(d, 32, 38, 26, (40,160,30))
    # Highlight
    circle(d, 24, 30, 8, (100,200,80))
    # Two barrels
    rect(d, 50, 30, 28, 9, (40,160,30), outline=(0,100,0), width=2)
    rect(d, 50, 42, 28, 9, (40,160,30), outline=(0,100,0), width=2)
    # Second barrel caps
    rect(d, 72, 32, 8, 5, (20,120,10))
    rect(d, 72, 44, 8, 5, (20,120,10))
    # Eyes
    circle(d, 24, 34, 5, (255,255,255))
    circle(d, 39, 34, 5, (255,255,255))
    circle(d, 24, 34, 2, (0,0,0))
    circle(d, 39, 34, 2, (0,0,0))
    save(img, 'repeater.png')

# ========================================
# POTATO MINE
# ========================================
def make_potatomine():
    img = Image.new('RGBA', (65, 70), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # Spikes
    d.polygon([(32,5),(28,20),(36,20)], fill=(180,120,40))
    d.polygon([(5,28),(20,24),(20,32)], fill=(180,120,40))
    d.polygon([(59,28),(44,24),(44,32)], fill=(180,120,40))
    # Body - potato
    circle(d, 32, 38, 24, (180,130,50))
    circle(d, 32, 38, 22, (200,150,70))
    # Potato spots
    circle(d, 22, 32, 4, (160,110,40))
    circle(d, 42, 35, 3, (160,110,40))
    circle(d, 28, 45, 3, (160,110,40))
    # Sleepy eyes (not armed)
    d.line([(23,37),(30,37)], fill=(80,50,10), width=3)
    d.line([(34,37),(41,37)], fill=(80,50,10), width=3)
    # Zz
    d.text((42, 18), 'z', fill=(100,100,200))
    d.text((47, 12), 'Z', fill=(100,100,200))
    save(img, 'potatomine.png')

# ========================================
# ZOMBIE BASIC
# ========================================
def make_zombie_basic():
    img = Image.new('RGBA', (65, 100), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # Legs
    rect(d, 18, 78, 12, 22, (60,90,40))
    rect(d, 34, 78, 12, 22, (60,90,40))
    rect(d, 18, 90, 14, 10, (80,60,30))
    rect(d, 34, 90, 14, 10, (80,60,30))
    # Body - blue shirt with tears
    rect(d, 14, 50, 36, 30, (70,100,160))
    # Torn lines
    d.line([(20,55),(25,70)], fill=(40,70,120), width=2)
    d.line([(38,58),(42,72)], fill=(40,70,120), width=2)
    # Arms - outstretched
    rect(d, -2, 52, 16, 8, (130,170,100))
    rect(d, 50, 52, 16, 8, (130,170,100))
    # Neck
    rect(d, 24, 44, 16, 8, (130,170,100))
    # Head
    circle(d, 32, 32, 22, (130,170,100))
    circle(d, 32, 32, 20, (150,190,120))
    # Messy hair
    d.polygon([(15,18),(12,10),(20,15),(18,8),(25,14),(23,7),(30,14)], fill=(50,30,10))
    d.polygon([(30,14),(35,7),(37,13),(42,8),(44,14),(49,12),(48,18)], fill=(50,30,10))
    # Zombie eyes
    circle(d, 24, 30, 6, (255,255,200))
    circle(d, 40, 30, 6, (255,255,200))
    circle(d, 24, 30, 3, (200,50,50))
    circle(d, 40, 30, 3, (200,50,50))
    circle(d, 25, 29, 1, (0,0,0))
    circle(d, 41, 29, 1, (0,0,0))
    # Exposed brain (top)
    d.polygon([(26,18),(32,12),(38,18)], fill=(200,100,100))
    # Mouth - rotting
    d.arc([22,38,42,46], 0, 180, fill=(80,40,20), width=3)
    d.line([(27,44),(30,44)], fill=(200,50,50), width=2)
    # Tie
    d.polygon([(30,50),(34,50),(32,65),(31,65)], fill=(80,20,20))
    save(img, 'zombie_basic.png')

# ========================================
# ZOMBIE CONE
# ========================================
def make_zombie_cone():
    img = Image.new('RGBA', (65, 110), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # Legs
    rect(d, 18, 88, 12, 22, (60,90,40))
    rect(d, 34, 88, 12, 22, (60,90,40))
    rect(d, 18, 99, 14, 11, (80,60,30))
    rect(d, 34, 99, 14, 11, (80,60,30))
    # Body
    rect(d, 14, 58, 36, 32, (70,100,160))
    # Arms
    rect(d, -2, 60, 16, 8, (130,170,100))
    rect(d, 50, 60, 16, 8, (130,170,100))
    rect(d, 24, 52, 16, 8, (130,170,100))
    # Head
    circle(d, 32, 40, 22, (130,170,100))
    circle(d, 32, 40, 20, (150,190,120))
    # Cone hat
    d.polygon([(10,28),(54,28),(52,22),(10,22)], fill=(255,165,0))
    d.polygon([(10,22),(52,22),(32,4)], fill=(255,140,0))
    d.line([(10,22),(52,22)], fill=(200,100,0), width=2)
    d.line([(10,28),(54,28)], fill=(200,100,0), width=2)
    # Cone stripes
    d.line([(32,4),(16,22)], fill=(200,100,0), width=1)
    d.line([(32,4),(24,22)], fill=(200,100,0), width=1)
    d.line([(32,4),(40,22)], fill=(200,100,0), width=1)
    d.line([(32,4),(48,22)], fill=(200,100,0), width=1)
    # Eyes
    circle(d, 24, 38, 6, (255,255,200))
    circle(d, 40, 38, 6, (255,255,200))
    circle(d, 24, 38, 3, (200,50,50))
    circle(d, 40, 38, 3, (200,50,50))
    # Mouth
    d.arc([22,46,42,54], 0, 180, fill=(80,40,20), width=3)
    save(img, 'zombie_cone.png')

# ========================================
# ZOMBIE BUCKET
# ========================================
def make_zombie_bucket():
    img = Image.new('RGBA', (70, 110), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # Legs
    rect(d, 20, 88, 12, 22, (60,90,40))
    rect(d, 36, 88, 12, 22, (60,90,40))
    rect(d, 20, 100, 14, 10, (80,60,30))
    rect(d, 36, 100, 14, 10, (80,60,30))
    # Body
    rect(d, 16, 58, 36, 32, (70,100,160))
    # Arms
    rect(d, 0, 60, 16, 8, (130,170,100))
    rect(d, 52, 60, 18, 8, (130,170,100))
    rect(d, 26, 52, 16, 8, (130,170,100))
    # Head
    circle(d, 34, 42, 22, (130,170,100))
    # Metal bucket
    rect(d, 12, 22, 44, 26, (150,150,150))
    rect(d, 14, 20, 40, 6, (180,180,180))
    rect(d, 10, 46, 48, 4, (120,120,120))
    # Bucket details
    d.line([(12,30),(56,30)], fill=(120,120,120), width=2)
    d.line([(12,38),(56,38)], fill=(120,120,120), width=2)
    # Bucket handle
    d.arc([20,12,48,26], 180, 360, fill=(120,120,120), width=3)
    # Eyes below bucket
    circle(d, 26, 44, 5, (255,255,200))
    circle(d, 42, 44, 5, (255,255,200))
    circle(d, 26, 44, 2, (200,50,50))
    circle(d, 42, 44, 2, (200,50,50))
    # Mouth
    d.arc([24,50,44,58], 0, 180, fill=(80,40,20), width=3)
    save(img, 'zombie_bucket.png')

# ========================================
# ZOMBIE FLAG
# ========================================
def make_zombie_flag():
    img = Image.new('RGBA', (80, 100), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # Legs
    rect(d, 30, 78, 12, 22, (60,90,40))
    rect(d, 46, 78, 12, 22, (60,90,40))
    rect(d, 30, 90, 14, 10, (80,60,30))
    rect(d, 46, 90, 14, 10, (80,60,30))
    # Body
    rect(d, 26, 50, 36, 30, (70,100,160))
    # Flag pole (held in arm)
    d.line([(8,10),(8,60)], fill=(180,140,80), width=3)
    # Flag
    d.polygon([(8,10),(40,18),(8,26)], fill=(255,0,0))
    d.line([(10,14),(38,18)], fill=(255,100,100), width=1)
    d.line([(10,22),(38,18)], fill=(180,0,0), width=1)
    # "!" on flag
    d.text((20, 13), '!', fill=(255,255,255))
    # Arm holding flag
    rect(d, 8, 52, 18, 8, (130,170,100))
    # Other arm
    rect(d, 62, 52, 18, 8, (130,170,100))
    # Neck
    rect(d, 36, 44, 16, 8, (130,170,100))
    # Head
    circle(d, 44, 32, 22, (130,170,100))
    circle(d, 44, 32, 20, (150,190,120))
    # Hair
    d.polygon([(28,20),(24,12),(32,17),(30,10),(37,16)], fill=(50,30,10))
    # Eyes
    circle(d, 36, 30, 6, (255,255,200))
    circle(d, 52, 30, 6, (255,255,200))
    circle(d, 36, 30, 3, (200,50,50))
    circle(d, 52, 30, 3, (200,50,50))
    # Mouth
    d.arc([34,38,54,46], 0, 180, fill=(80,40,20), width=3)
    save(img, 'zombie_flag.png')

# ========================================
# ZOMBIE FOOTBALL
# ========================================
def make_zombie_football():
    img = Image.new('RGBA', (75, 105), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # Legs - bigger
    rect(d, 22, 82, 14, 23, (60,90,40))
    rect(d, 40, 82, 14, 23, (60,90,40))
    rect(d, 22, 94, 16, 11, (80,60,30))
    rect(d, 40, 94, 16, 11, (80,60,30))
    # Body - football jersey (wider)
    rect(d, 10, 52, 54, 32, (0,0,200))
    # Jersey number
    d.text((28, 60), '55', fill=(255,255,255))
    # Shoulder pads
    rect(d, 4, 50, 20, 14, (0,0,180))
    rect(d, 50, 50, 20, 14, (0,0,180))
    # Arms (thicker)
    rect(d, -4, 54, 18, 10, (130,170,100))
    rect(d, 60, 54, 18, 10, (130,170,100))
    # Neck
    rect(d, 30, 46, 14, 8, (130,170,100))
    # Head
    circle(d, 37, 34, 22, (130,170,100))
    circle(d, 37, 34, 20, (150,190,120))
    # Football helmet
    rect(d, 16, 18, 42, 22, (0,0,180))
    d.arc([16,12,58,30], 180, 360, fill=(0,0,180))
    # Face guard
    d.line([(20,28),(54,28)], fill=(180,180,180), width=3)
    d.line([(37,18),(37,38)], fill=(180,180,180), width=2)
    # Eyes behind guard
    circle(d, 28, 32, 5, (200,50,50))
    circle(d, 46, 32, 5, (200,50,50))
    circle(d, 29, 31, 2, (0,0,0))
    circle(d, 47, 31, 2, (0,0,0))
    # Mouth
    d.arc([25,38,49,46], 0, 180, fill=(80,40,20), width=3)
    save(img, 'zombie_football.png')

print('Generating sprites...')
make_sunflower()
make_peashooter()
make_wallnut()
make_snowpea()
make_cherrybomb()
make_repeater()
make_potatomine()
make_zombie_basic()
make_zombie_cone()
make_zombie_bucket()
make_zombie_flag()
make_zombie_football()
print('Done! All sprites generated.')
