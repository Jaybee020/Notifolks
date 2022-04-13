const constrictAddr = (address) =>
  address.substring(0, 9) + "..." + address.substring(48, 58);

const constrictAddrLong = (address) =>
  address.substring(0, 20) + "..." + address.substring(50, 58);

const NumberWithCommas = (x, dp = 2) => {
  if (x.toString().includes(".")) {
    const y = x.toString().split(".");
    return (
      y[0]?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
      "." +
      y[1]?.toString().substring(0, dp)
    );
  } else {
    return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
};
export { constrictAddr, constrictAddrLong, NumberWithCommas };
