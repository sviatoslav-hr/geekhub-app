export class Month {
  constructor(
    public id: number,
    public name: string,
    public fullname: string
  ) {
  }
}

export const months = [
  new Month(1, 'Jan', 'January'),
  new Month(2, 'Feb', 'February'),
  new Month(3, 'Mar', 'March'),
  new Month(4, 'Apr', 'April'),
  new Month(5, 'May', 'May'),
  new Month(6, 'June', 'June'),
  new Month(7, 'July', 'July'),
  new Month(8, 'Aug', 'August'),
  new Month(9, 'Sept', 'September'),
  new Month(10, 'Oct', 'October'),
  new Month(11, 'Nov', 'November'),
  new Month(12, 'Dec', 'December'),
];
