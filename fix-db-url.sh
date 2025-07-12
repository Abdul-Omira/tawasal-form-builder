#!/bin/bash
set -e
sed -i 's|postgres://postgres:SyriaDB@2024!Secure@db:5432/ministry_communication|postgres://postgres:SyriaDB@2024!Secure@localhost:5432/ministry_communication|' /opt/moct-platform/.env
pm2 restart moct-platform 