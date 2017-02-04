#!/usr/bin/env python

import json

a=json.loads('{"errorno":0,"data":{"token":"BWYBNlBhBzFWagFnUWNUN1ExVD1UYVZkBDwHZ1NiDT0="},""}')
print json.dumps(a, sort_keys=True, indent=4)

