#!/bin/bash
cd /var/www/tawasal
export NODE_ENV=production
node --loader tsx server/index.ts
