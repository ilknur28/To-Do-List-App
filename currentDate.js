// 2 functions: getDate and getweekDay

exports.getDate = function (){
  const today = new Date();
  const options = { // var for formatting the date
    weekday: "long",
    day: "numeric",
    month: "long",
  };

  return today.toLocaleDateString("en-US", options); // Current day
}

exports.getweekDay = function (){
  const today = new Date();
  const options = { // var for formatting the day
    weekday: "long",
  };

  return today.toLocaleDateString("en-US", options); // Current day
}
