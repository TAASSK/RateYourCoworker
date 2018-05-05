/*
 * Angular library
 * */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/*
 * Models
 * */
import { User } from '../../shared';

/*
 * Services
 * */
import { UserService } from '../../core/services';

@Component({
	selector: 'app-account',
	templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit {

	user: User;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private userService: UserService
	) {

	
		this.user = new User();

		this.user.id = 101;
		this.user.email = 'jp.joule18@gojoule.me';
		this.user.firstName = 'John';
		this.user.lastName = 'Doe';
		this.user.jobTitle = 'Employee';
		this.user.employer = 'Random Corp.';
		this.user.location = 'Dallas, TX';
	

	}

	ngOnInit() {
		/*
		this.user = new User();
		this.route.params.subscribe((params: any) => {
			this.user.id = params.id;
			let num = params.id;
			if(num) {
			  this.userService.getById(+num).subscribe(data => {
				this.user = this.user.deserialize(data);
				console.log(data);
				console.log(this.user);
			  });
			}
		  });
		  console.log(this.user);
		  */
	 }

}
