import "../../styles/Bars/BalanceBar.css";

function Balance({ amount, currency, address }) {
  const shortAddress = address.slice(0, 4) + "..." + address.slice(-4);
  return (
    <div className="balance">
      <span className="value">{amount}&thinsp;{currency}</span>
      <span className="address">{shortAddress}</span>
    </div>
  );
}

export default Balance;