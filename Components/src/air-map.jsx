import React from 'react'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import _history from '../history/_history.js'

import '../stylesheets/air-map.css'
import map from '../../public/images/map.svg'

class AirMap extends React.Component{

	handleRouteToHome(){
		_history.push(`/`)
	}
	
	componentDidMount() {
		this.eventClock = this.printClock.bind(this)
		this.eventClock()
		this.intervalClock = setInterval(this.eventClock, 1000)
		
		this.eventMap = this.setColorInMap.bind(this)
		this.eventMap()
		this.intervalMap = setInterval(this.eventMap, 300000)

		this.onEnterPath()
	}

	componentWillUnmount() {
		clearInterval(this.intervalClock)
		clearInterval(this.intervalMap)
	}

	onEnterPath() {
		const region = [`제주`, `부산`, `울산`, `경남`, `대구`, `경북`, `광주`, `전남`, `전북`, `대전`, `세종`, `충남`, `충북`, `강원`, `경기`, `인천`, `서울`]
		document.querySelector(`.air-map-img`).addEventListener(`load`, () => {
			document.querySelector(`.air-map-img`).contentDocument.querySelectorAll(`path`).forEach(path => {
				path.addEventListener(`mouseenter`, event => {
					if (region.indexOf(event.target.id) !== -1) {
						event.target.style.transition = `all .2s ease-out`
						event.target.style.fillOpacity = `0.5`
						document.querySelector(`.pm-value`).textContent = `${event.target.id} : ${event.target.dataset.pmValue || `loading...`}`
					}					
				})
				path.addEventListener(`mouseleave`, event => {
					if (region.indexOf(event.target.id) !== -1) {
						event.target.style.fillOpacity = `1`
						document.querySelector(`.pm-value`).textContent = ``
					}					
				})
			})
		})
	}

	setColorInMap() {
		fetch(`/update_map/www.kweather.co.kr/air/data/api/air_1hr_all2.xml`).then(res =>
			res.text()
		).then(async data => {
			const oParser = new DOMParser()
			const oDOM = oParser.parseFromString(data, `text/xml`)
			let json

			await fetch(`https://ip-api.io/json/`)
				.then(res => res.json())
				.then(data => {
					json = data
				})
			for (const item of oDOM.querySelector(`air`).children) {
				this.setItemColor(item, json)
					.setCurrentLocation(json)
					.setColorBlue()					
					.setColorOrange()
					.setColorRed()					
					.setEventLoadSVG()
			}
		})
	}

	setItemColor(item, json) {
		const _json = json
		let pmValue = item.querySelector(`pm10Value`).textContent
		let location = document.querySelector(`.air-map-img`).contentDocument.querySelector(`#${item.querySelector(`stationName`).textContent}`)
		if (location) {
			location.dataset.pmValue = pmValue
		}
		return {	
			setColorBlue() {		
				if (pmValue !== `-` && pmValue < 30) {					
					if (!location) {
						return this
					}				
					location.style.fill = `#32a1ff`
					document.querySelector(`.current-air`).style.color = `#32a1ff`
				}
				return this
			},			
			setColorOrange() {
				if (pmValue !== `-` && pmValue > 80) {
					if (!location) {
						return this
					}
					location.style.fill = `#fd9b5a`
					document.querySelector(`.current-air`).style.color = `#fd9b5a`
				}
				return this
			},
			setColorRed() {
				if (pmValue !== `-` && pmValue > 150) {					
					if (!location) {
						return this
					}
					location.style.fill = `#ff5959`
					document.querySelector(`.current-air`).style.color = `#ff5959`
				}
				return this
			},
			setCurrentLocation() {
				const ISO3166 = {
					제주: 49, 
					부산: 26,
					울산: 31,
					경남: 48,
					대구: 27,
					경북: 47,
					광주: 29,
					전남: 46,
					전북: 46,
					대전: 30,
					세종: 50,
					충남: 44,
					충북: 43,
					강원: 42,
					경기: 41,
					인천: 28,
					서울: 11,
				}
				let region						
				for(let i = 0; i < Object.entries(ISO3166).length; i++) {
					if (Object.entries(ISO3166)[i][1] === Number(_json.region_code)) {
						region = Object.entries(ISO3166)[i][0]
					}
				}					
				if (item.querySelector(`stationName`).textContent === region) {
					location.style.stroke = `white`
					location.style.strokeWidth = `2`
					document.querySelector(`.air-map-text p`).innerHTML = `현재지역 미세먼지 수치 <br/> ${region}: <span class='current-air'>${pmValue}</span>`
				}
				return this
			},
			setEventLoadSVG() {					
				document.querySelector(`.air-map-img`).addEventListener(`load`, () => {
					pmValue = item.querySelector(`pm10Value`).textContent
					location = document.querySelector(`.air-map-img`).contentDocument.querySelector(`#${item.querySelector(`stationName`).textContent}`)
					if (location) {
						location.dataset.pmValue = pmValue
					}
					this.setCurrentLocation()
						.setColorBlue()
						.setColorOrange()
						.setColorRed()
				})
				return this
			}
		}		
	}

	printClock() {
		const clock = document.getElementById(`clock`)
		const currentDate = new Date()
		let amPm = `AM`
		let currentHours = this.addZeros(currentDate.getHours(), 2)
		const currentMinute = this.addZeros(currentDate.getMinutes(), 2)
		let currentSeconds =  this.addZeros(currentDate.getSeconds(), 2)

		if (currentHours >= 12) {
			amPm = `PM`
			if (currentHours > 12) {
				currentHours = this.addZeros(currentHours - 12,2)
			}			
		}

		if (currentSeconds >= 50) {
			currentSeconds = `<span>${currentSeconds}</span>`
		}
		clock.innerHTML = `${currentHours}:${currentMinute}:${currentSeconds} <span>${amPm}</span>`		
	}

	addZeros(num, digit) {
		let zero = ``
		num = num.toString()
		if (num.length < digit) {
			for (let i = 0; i < digit - num.length; i++) {
				zero += `0`
			}
		}
		return zero + num
	}

	render(){
		return(
			<div className='air-map'>
				<object className='air-map-img' data={map} type='image/svg+xml'></object>
				<span className='air-map-text'>			
					<span className='pm-value'></span>		
					<span id='clock'>00:00:00</span>
					<p i18n-content='AIR_MAP_TEXT'></p>					
				</span>
			</div>				
		)
	}
}

AirMap = withRouter(connect(null, null)(AirMap))

export default AirMap
