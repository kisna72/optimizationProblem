function FisherYatesShuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}

function isArrayOfSameItems(array){
  // assume true, and if any of the items is not the same as previous, return false
  let allSame = true
  for(let i = 1; i < array.length; i++){
    if(array[i] !== array[i-1]){
      allSame = false
    }
  }
  return allSame
}

export {
    FisherYatesShuffle,
    isArrayOfSameItems
}