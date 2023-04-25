import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { NgToastService } from 'ng-angular-popup';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../models/user.model';

@Component({
  selector: 'app-create-registration',
  templateUrl: './create-registration.component.html',
  styleUrls: ['./create-registration.component.scss'],
})
export class CreateRegistrationComponent implements OnInit {
  public packages = ['Monthly', 'Quaterly', 'Yearly'];
  public genders = ['Male', 'Female'];
  public importantList: string[] = [
    'Toxic Fat Reduction',
    'Energy and Endurance',
    'Building Lean Muscles',
    'Fitness',
    'Cardio',
    'Sugar Craving Body',
  ];

  public registerForm!: FormGroup;
  public userIdToUpdate!: number;
  public isUpdateActive: boolean = false;
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toastService: NgToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      mobile: [''],
      weight: [''],
      height: [''],
      bmi: [''],
      bmiResult: [''],
      gender: [''],
      requireTrainer: [''],
      package: [''],
      important: [''],
      haveGymBefore: [''],
      enqueryDate: [''],
    });

    //To fill the updated BMI field we need to use this code snippite
    this.registerForm.controls['height'].valueChanges.subscribe((res) => {
      this.calculateBmi(res);
    });
    this.activatedRoute.params.subscribe((val) => {
      this.userIdToUpdate = val['id'];
      this.api.getRegisteredUserId(this.userIdToUpdate).subscribe((res) => {
        this.isUpdateActive = true;
        this.fillFormToUpdate(res);
      });
    });
  }

  // This is the submit button function when we are submitting the form
  submit() {
    // console.log(this.registerForm.value);
    this.api.postRegistration(this.registerForm.value).subscribe((res) => {
      this.toastService.success({
        detail: 'Sucess',
        summary: 'Enquery Added',
        duration: 4000,
      });
      this.registerForm.reset();
    });
  }

  update() {
    this.api
      .updateRegisterUser(this.registerForm.value, this.userIdToUpdate)
      .subscribe((res) => {
        this.toastService.success({
          detail: 'Sucess',
          summary: 'Enquery Updated',
          duration: 4000,
        });
        this.registerForm.reset();
        this.router.navigate(['list']);
      });
  }

  // To calculate BMI we have created this fuction
  calculateBmi(heightValue: number) {
    const weight = this.registerForm.value.height;
    const height = heightValue;
    const bmi = weight / (height * height);
    this.registerForm.controls['bmi'].patchValue(bmi); //to patch the bmi value
    switch (true) {
      case bmi < 18.5:
        this.registerForm.controls['bmiResult'].patchValue('Underweight');
        break;

      case bmi >= 18 && bmi < 25:
        this.registerForm.controls['bmiResult'].patchValue('Normal');
        break;

      case bmi >= 25 && bmi < 30:
        this.registerForm.controls['bmiResult'].patchValue(
          'UnderweiOverweightght'
        );
        break;

      default:
        this.registerForm.controls['bmiResult'].patchValue('Obese');
        break;
    }
  }
  fillFormToUpdate(user: User) {
    this.registerForm.setValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      weight: user.weight,
      height: user.height,
      bmi: user.bmi,
      bmiResult: user.bmiResult,
      gender: user.gender,
      requireTrainer: user.requireTrainer,
      package: user.package,
      important: user.important,
      haveGymBefore: user.haveGymBefore,
      enqueryDate: user.enqueryDate,
    });
  }
}
