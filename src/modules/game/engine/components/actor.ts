import { Component } from 'ape-ecs'

export default class Actor extends Component {
	userID!: string
	username!: string
	color!: number
	static typeName = 'Actor'
	static key = 'actor'
	static properties = {
		userID: '',
		username: '',
		color: 0,
	}
}
