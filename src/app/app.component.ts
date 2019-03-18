import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataType, DataModel } from './service/datatype';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-d3';
  data: Observable<DataModel[]>;

  constructor(private http: HttpClient) {
    this.data = this.http.get<DataModel[]>('assets/data/data.json');
  }
}
