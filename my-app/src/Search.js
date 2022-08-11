function Search(props) {
    const json = require('./data/nested_no_lookback.json');
    const myData = props.data.data

    // function myFunction() {
    //     // Declare variables
    //     var input, filter, ul, li, a, i, txtValue;
    //     input = document.getElementById('search');
    //     filter = input.value.toUpperCase();
    //     ul = document.getElementById("test");
    //     li = ul.getElementsByTagName('li');


    //     // Loop through all list items, and hide those who don't match the search query
    //     for (i = 0; i < li.length; i++) {
    //         a = li[i].getElementsByTagName("a")[0];
    //         txtValue = a.textContent || a.innerText;
    //         if (txtValue.toUpperCase().indexOf(filter) > -1) {
    //             li[i].style.display = "";
    //         } else {
    //             li[i].style.display = "none";
    //         }
    //     }
    // }


    return (
        <div>
            <input type="text" id="search" placeholder="Search for tables.." />
            {/* <Tree wrapped={json} />                */}
            <div id="test">
            {myData.map(d => (
                  <li  key={d.name} id="span">
                    <a>{d.name}</a>
                  </li>
                ))}
                {console.log(myData)}
            </div>
             {/* <ul id="myUL">
                    <li><a href="#">Adele</a></li>
                    <li><a href="#">Agnes</a></li>

                    <li><a href="#">Billy</a></li>
                    <li><a href="#">Bob</a></li>

                    <li><a href="#">Calvin</a></li>
                    <li><a href="#">Christina</a></li>
                    <li><a href="#">Cindy</a></li>
                </ul> */}
        </div>


    )

}

export default Search;