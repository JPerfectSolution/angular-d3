import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataType, DataModel, StackedData } from './service/datatype';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-d3';
  data: Observable<DataModel[]>;
  stackedData: Observable<StackedData[]>;

  constructor(private http: HttpClient) {
    this.data = this.http.get<DataModel[]>('assets/data/data.json');
    this.stackedData = this.http.get<StackedData[]>('assets/data/stacked-chart.json');
  }
}
