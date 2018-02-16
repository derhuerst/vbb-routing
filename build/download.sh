#!/bin/sh

base_url='https://vbb-gtfs.jannisr.de/latest/'
download () {
	wget -nc -qc --show-progress --header='accept-encoding: gzip' $base_url$1
}

download 'agency.txt'
download 'calendar.txt'
download 'calendar_dates.txt'
download 'routes.txt'
download 'stop_times.txt'
download 'stops.txt'
download 'trips.txt'
