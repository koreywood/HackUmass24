import board
import busio
import struct
import time
import digitalio
import pwmio
import requests


TCRA = 0X0C

TCRD = 0.2

TCRLO = 0
TCRLF = "H"
TCRMO = TCRLO + struct.calcsize(TCRLF)
TCRMS = 254
TCRMF = "B" * TCRMS
TCRIF = TCRLF + TCRMF
TCRIBC = struct.calcsize(TCRIF)

try:
    i2c = board.I2C()
except:
    i2c = busio.I2C(scl=board.SCL, sda=board.SDA)
    
while not i2c.try_lock():
    pass

button = digitalio.DigitalInOut(board.D4)
button.direction = digitalio.Direction.INPUT
button.pull = digitalio.Pull.UP

buzzer = digitalio.DigitalInOut(board.D6)
buzzer.direction = digitalio.Direction.OUTPUT

item_database = {}


def add_item_to_database(item_name):
    item_database[item_name] = item.database.get(item_name, 0) + 1
    print(f"Item '{item_name}' added. Current database: {item_database}")

def beep():
    buzzer.value = True
    time.sleep(0.2)
    buzzer.value = False
    
while True:
    print("Press the button to start scanning...")
    while button.value:
        time.sleep(0.1)
        
    print("Button pressed! Starting scan...")
    
    while True:
        read_data = bytearray(TCRIBC)
        i2c.readfrom_into(TCRA, read_data)
    
        message_length, = struct.unpack_from(TCRLF, read_data, TCRLO)
        message_bytes = struct.unpack_from(TCRMF, read_data, TCRMO)
    
        if message_length > 0:
                
            message_string = ''.join(chr(byte) for byte in message_bytes[:message_length])
            print(f"Scanned message: {message_string}")
                
            beep()
            
            requests.get("http://localhost:3000/getItem?id=" + message_string)
            
            break
        
        time.sleep(TCRD)
        

    print("Scan complete. Waiting for button release...")
    while not button.value:
        time.sleep(0.1)
    
    print("Button released. Ready for next scan.")