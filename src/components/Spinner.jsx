import './Spinner.css';
 
export default function Spinner({ text = 'Loading...' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}
 