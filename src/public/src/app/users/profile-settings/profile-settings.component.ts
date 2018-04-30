/*
 * Angular library
 * */
import { Component, OnInit } from '@angular/core';

/*
 * Models
 * */
import { User } from '../../shared';

@Component({
	selector: 'app-profile-settings',
	templateUrl: './profile-settings.component.html'
})
export class ProfileSettingsComponent implements OnInit {

	user: User;

	constructor() {

		this.user = new User();

		this.user.id = 101;
		this.user.email = "jp.joule18@gojoule.me";
		this.user.firstName = "John";
		this.user.lastName = "Doe";
		this.user.jobTitle = "Employee";
		this.user.employer = "Random Corp.";
		this.user.location = "Dallas, TX";

	}

	ngOnInit() { }

}
