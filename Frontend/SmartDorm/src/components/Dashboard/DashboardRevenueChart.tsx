import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,CategoryScale,LinearScale,BarElement,Tooltip,Legend
} from "chart.js";
ChartJS.register(CategoryScale,LinearScale,BarElement,Tooltip,Legend);

export default function DashboardRevenueChart({ bills, bookings, year, month }: any) {

  const labels = getLabels(year, month);
  const datasets = getDatasets(bills, bookings, labels, year, month);

  return (
    <section className="row g-3 mt-4">
      {datasets.map((d:any, idx:number)=>(
        <div key={idx} className="col-12 col-md-6 col-lg-4">
          <ChartCard {...d} labels={labels} />
        </div>
      ))}
    </section>
  );
}

/* === แยก logic ทำงาน === */

function getLabels(year: string, month: string) {
  if (!year) return ["2566","2567","2568"]; // mock ปี ถ้าต้องรวมทุกปี
  if (year && !month)
    return ["ม.ค","ก.พ","มี.ค","เม.ย","พ.ค","มิ.ย","ก.ค","ส.ค","ก.ย","ต.ค","พ.ย","ธ.ค"];
  return [`${month}/${year}`];
}

function getDatasets(bills:any[], bookings:any[], labels:string[], year:string, month:string) {
  return [
    makeDataset("ค่าเช่าจอง", getSum(bookings,"rent",year,month), "#5A00A8"),
    makeDataset("ค่ามัดจำ", getSum(bookings,"deposit",year,month), "#8D41D8"),
    makeDataset("ค่าจอง", getSum(bookings,"bookingFee",year,month), "#FBD341","#4A0080"),
    makeDataset("รวมการจอง", getSum(bookings,"totalBooking",year,month), "#00916E"),
    makeDataset("ค่าเช่าห้อง", getSum(bills,"rent",year,month), "#5A00A8"),
    makeDataset("ค่าน้ำ", getSum(bills,"waterCost",year,month), "#48CAE4","#002B3D"),
    makeDataset("ค่าไฟ", getSum(bills,"electricCost",year,month), "#FF9800"),
    makeDataset("รวมบิล", getSum(bills,"total",year,month), "#00B4D8"),
  ];
}

function makeDataset(title:string,data:number[],color:string,text?:string){
  return { title, data, color, text };
}

function getSum(arr:any[], key:string, y:string, m:string){
  return [arr.reduce((s,b)=>s+(b[key]||0),0)];
}

function ChartCard({ title, labels, data, color }:any){
  return(
    <div className="card shadow-sm" style={{borderRadius:"16px"}}>
      <div className="card-body">
        <strong style={{color:"#4A0080"}}>{title}</strong>
        <div style={{height:200}}>
          <Bar data={{labels,datasets:[{data,label:title,backgroundColor:color,borderRadius:8}]}} />
        </div>
      </div>
    </div>
  );
}