export class DataType {
  name: string;
  data: LineData[];
}

export class LineData {
  name: string;
  values: Point[];
}

export class Point {
  date: string;
  price: number;
}
export interface DataModel {
  letter: string;
  frequency: number;
}

export class StackedData {
  year: string;
  data1: number;
  data2: number;
}
