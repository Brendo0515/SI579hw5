document.getElementById("show_rhymes").addEventListener("click", getRhymes);
document.getElementById("show_synonyms").addEventListener("click", getSynonyms);
document.getElementById("word_input").addEventListener('keydown', function(event) {
    if (event.code == 'Enter') {     
      getRhymes()
    }
  });
document.getElementById("saved_words").innerHTML = "(none)"
let savedwordList = [];

async function getRhymes(){
    let query = document.getElementById("word_input").value;
    document.getElementById("word_output").value = "...loading"; //shows "loading" text when items are still fetching
    const results = await fetch("https://api.datamuse.com/words?rel_rhy="+query);
    let data = await results.json();
    document.getElementById("output_description").innerHTML = "Words that rhyme with " + query + ":";
    if (data.length === 0) {
        document.getElementById("word_output").value = "No results";
    }
    else{
        document.getElementById("word_output").value = "";
        let syllableArray = groupBy(data, "numSyllables");
        for (syl of Object.keys(syllableArray)) {
            const newH2Element = document.createElement('h2');
            newH2Element.textContent = syl + " syllable:";
            document.getElementById("word_output").appendChild(newH2Element);
            for (x in syllableArray[syl]) {
                const newListElement = document.createElement('li');
                newListElement.textContent = syllableArray[syl][x].word;
                let w = syllableArray[syl][x].word;
                const doneButtonElement = document.createElement('button');
                doneButtonElement.id = "btn" + w;
                doneButtonElement.textContent = "(save)";
                newListElement.append(doneButtonElement);
                document.getElementById("word_output").appendChild(newListElement);
                document.getElementById("btn" + w).addEventListener("click", function saveWord (){
                    savedwordList.push(w);
                    document.getElementById("saved_words").innerHTML = "";
                    document.getElementById("saved_words").innerHTML = savedwordList.join(', '); 
                });
            }
        }
    }
}

async function getSynonyms(){
    let query = document.getElementById("word_input").value;
    document.getElementById("word_output").value = "...loading";
    const results = await fetch("https://api.datamuse.com/words?ml="+query);
    let data = await results.json();
    document.getElementById("output_description").innerHTML = "Words with a similar meaning to " + query + ":";
    if (data.length === 0) {
        document.getElementById("word_output").value = "No results";
    }
    else{
        document.getElementById("word_output").value = "";
        for (x of data) {
            const newListElement = document.createElement('li');
            newListElement.textContent = x.word;
            let w = x.word;
            const doneButtonElement = document.createElement('button');
            doneButtonElement.id = "btn" + w;
            doneButtonElement.textContent = "(save)";
            newListElement.append(doneButtonElement);
            document.getElementById("word_output").appendChild(newListElement);
            document.getElementById("btn" + w).addEventListener("click", function saveWord (){
                savedwordList.push(w);
                document.getElementById("saved_words").innerHTML = "";
                document.getElementById("saved_words").innerHTML = savedwordList.join(', '); 
            });
        }
    }
}

/**
 * Returns a list of objects grouped by some property. For example:
 * groupBy([{name: 'Steve', team:'blue'}, {name: 'Jack', team: 'red'}, {name: 'Carol', team: 'blue'}], 'team')
 * 
 * returns:
 * { 'blue': [{name: 'Steve', team: 'blue'}, {name: 'Carol', team: 'blue'}],
 *    'red': [{name: 'Jack', team: 'red'}]
 * }
 * 
 * @param {any[]} objects: An array of objects
 * @param {string|Function} property: A property to group objects by
 * @returns  An object where the keys representing group names and the values are the items in objects that are in that group
 */
function groupBy(objects, property) {
    // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
    // value for property (obj[property])
    if(typeof property !== 'function') {
        const propName = property;
        property = (obj) => obj[propName];
    }

    const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
    for(const object of objects) {
        const groupName = property(object);
        //Make sure that the group exists
        if(!groupedObjects.has(groupName)) {
            groupedObjects.set(groupName, []);
        }
        groupedObjects.get(groupName).push(object);
    }

    // Create an object with the results. Sort the keys so that they are in a sensible "order"
    const result = {};
    for(const key of Array.from(groupedObjects.keys()).sort()) {
        result[key] = groupedObjects.get(key);
    }
    return result;
}