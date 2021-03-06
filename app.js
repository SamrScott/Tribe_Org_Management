/* TEMPLATE DATA GET FUNCTION
async function show_some_data(params){ //<CHANGEME> name function after data being displayed
    console.log('in <FUNCTION NAME>')

    if(!logged_in()){show_home();return}//in case followed a link after logging out. This prevents the user from using this feature when they are not authenticated.

    hide_menu()

    //<CHANGEME> create div names related to what data is being viewed
    //build web page with Title, Info, and Content sections
    tag("canvas").innerHTML=` 
        <div class="page">
            <div id="data-title" style="text-align:center"><h2>Data</h2></div>
            <div id="data-message" style="width:100%"></div>
            <div id="data_panel"  style="width:100%">
            </div>
        </div>  
    `

    //show spinner loading icon
    tag("data-message").innerHTML='<i class="fas fa-spinner fa-pulse"></i>' //<New Message ID>

    const response=await server_request({
        mode:"<SERVER FUNCTION NAME>" //the name of a function in app.gs on GAS
    })
    //remove spinner icon
    tag("data-message").innerHTML='' //<New Message ID>

    console.log('<Data title>: ',response)

    if(response.status==="success"){//If the data is retrieved successfully, we proceed.
    
        tag("data-title").innerHTML='<h2>Data</h2>'
        //<CHANGEME>Build the table to display the groups.
        const html=[`
        <table class="inventory-table">
            <tr>
            <th class="sticky">COLUMN NAME</th>
            <th class="sticky">COLUMN NAME</th>
            <th class="sticky">CoLUMN NAME</th>
            </tr>
            `] //<Add Columns As Needed>

    
        //processing the data to fit in the table
        for(record of response.data){
            let target=html
            //add a new table row to the table for each group
            target.push("<tr>")

            //Header for Colum 1
            target.push(`<td style="text-align:left">${record.fields.column1data}</td>`)//<CHANGEME> to column name

            //Header for Column 2
            target.push(`<td style="text-align:left">${record.fields.column2data}</td>`) //<CHANGEME> to column name

            //Header of Column 3
            target.push(`<td>${record.fields.colum3data}</td>`) //<CHANGEME> to column name

            target.push("</tr>")
        }
        html.push("</table>")
        tag("data_panel").innerHTML=html.join("") //<CHANGEME> to panel name
    }else{
        //This executes if the data needed to create the form or report is not retrieved successfully. It is essentially an error message to the user.
        tag("data_panel").innerHTML="Unable to get group list: " + response.message + "." \\<CHANGEME> to panel name
    }
}
*/

//gas project /apps/brookers/system 
//This global variable is set to contain the information needed to make a request of the Google App Script server.
const gas_end_point = 'https://script.google.com/macros/s/'+gas_deployment_id+'/exec'

//This global variable defines the first two navigation items in the menu. In this app there are only two main navigation items "Home" and "Locations". These two menu items are visible regardless of login status.  
const nav_menu=[
    //Note that a menu item is added by inserting an object for that menu item. The 'label' is the text that the user sees for that menu option. The function is the javascript function invoked when selecting that option. Here we insert the "home" and "locations" menu items. Both initiate a call to the navigate function which loads the appropriate page. The navigate function is used to help ensure smooth navigation. It allows the user to use the back botton in their browser when navigating between pages on the site (without navigating out ot the site). The navigate can accept parameters that can be passed to the function called by navigate.
    {label:"Home",function:"navigate({fn:'show_home'})"},
    //{label:"Locations",function:"navigate({fn:'show_locations'})"},
    
]

//This global variable sets the menu items for an unautheticated user.  
const unauthenticated_menu=[
    //The unautheticated user is presented with the "Home" and "Locations" (defined in the nav_menu global variable).
    {menu:nav_menu},
    //this empty object inserts a horizontal line in the navigation menu panel
    {},
    //The unauthenticated user is also presented with the "Login" and "Recover password" menu options.
    {label:"Login",function:"login()",home:"Login",panel:"login_panel"},
    {label:"Recover Password",function:"recover_password()",panel:"recover"}, 
]

//This global variable sets the menu items for an autheticated user.  
const authenticated_menu=[
    //The autheticated user is presented with the "Home" and "Locations" (defined in the nav_menu global variable).
    {menu:nav_menu},
    //this empty object inserts a horizontal line in the navigation menu panel
    //{},
    //The authenticated user is also presented with additional menu options.
    //The first item loads the user's name (get_user_name) which is the label for a top-level menu which is built for the user functions
    {label:get_user_name,id:"user-menu", menu:[
        //the user functions include the ability to change their password and edit their personal data
        {label:"Change Password",function:"change_password()",panel: "password_panel"},
        //{label:"Personal Data",function:"navigate({fn:'personal_data'})"},
    ]},
    
    //This menu item builds a sub menu that provides the user with the functionality to request time off and see their requests
    /*{label:"Time Off",id:"menu1",menu:[
        {label:"Request Time Off",function:"navigate({fn:'request_time_off'})"}, 
        {label:"My Requests",function:"navigate({fn:'show_time_off'})"}, 
    ]},*/
    //This menu item allows the user to add additional users. Note the "roles" property of the object. Only users with the role of "manager", "owner", or "administrator" will see this menu item. User roles are not heirachical. All user types you wish to see a menu item must be listed in the elements of the array.
    //{label:"Add Employee",function:"navigate({fn:'create_account'})", roles:["manager","owner","administrator"]}, 
    //This menu item adds the menu item for updating an inventory count. Notice how a parameter is passed to the "ice_cream_inventory" function
    //{label:"Enter Ice Cream Inventory",home:"Inventory",function:"navigate({fn:'record_inventory'})"},
    //the remaining menu items are added
    //{label:"Ice Cream Inventory Summary",home:"Inventory",function:"navigate({fn:'show_inventory_summary'})", roles:["owner","administrator"]},

    
    
    {}, //section for Tribe of Kyngs Functions
    {label:"Groups",function:"navigate({fn:'show_group_list'})"},
    
    {label:get_group_menu_item, id:"manage_button", function: "navigate({fn:'manage_my_group'})", roles:["district_leader", "region_leader"]},
    {label:"View Members",function:"navigate({fn:'show_user_list'})"},
    {label:"Admin Tools",id:"menu2", roles:["administrator"], menu:[
        //{label:"Update/Promote Leader",function:"update_user()",panel:"update_user"},
        {label:"Add Member",function:"navigate({fn:'add_member'})", roles:["administrator","district leader","region leader"]},//This menu item adds a new user to the system
        {label:"Create/Promote Leader",function:"navigate({fn:'employee_list'})"},
    ]},
    {},
    //This menu item allows the user to logout
    {label:"Logout",function:"logout()", home:"Logout"},
]

function get_group_menu_item() {
    //gets the current logged-in user's group name
    data=get_user_data()
    console.log(data)
    msg = "Manage My "
    group_type = ''
    for (role in data.roles) {
        if (data.roles[role] == "region_leader"){group_type = "Region"}
        else if (data.roles[role] == "district_leader"){group_type = "District"}
        else if (data.roles[role] == "table_leader"){group_type = "Table"}
    }
    if (group_type === '')
        group_type = "Friends"
    return msg + group_type
}


function show_home(){
    
    //builds the menu for the home screen
    const menu=[]
    //current_menu is a global variable that is built based on the set of menu items defined for users and their roles. 
    for(item of current_menu){
        if(item.home){
            menu.push(`<a onClick="${item.function}">${item.home}</a>`)
        }
    }

    //the main page is rendered with the Tribe of Kyngs logo. 

    tag("canvas").innerHTML=` 
    <div class="center-screen">
    <h2 style="color:darkslategray">Welcome to the</h2>
    <h1><span style="color:goldenrod">TRIBE <span style="color:maroon;font-size:28">of</span> KYNGS</span></h1>
    <h2 style="color:darkslategray">Management Page</h2>
    <p><img height="${window.innerHeight * .6}" src="images/tribe_of_kyngs_logo.jpg"></p>
    <div style="text-align:center"></div>
    
    
    </div>
    `

    //The navigation menu is hidden (the three parallel lines are show) when the homepage is rendered.
    hide_menu()
}

function get_user_name(){
    //returns the user's first and last name. Used when building the navigation menu to be the label for the menu items related to maintaining the user. The get_user_data function reads the user information from the data cookie that is created when the user logs in.
    data=get_user_data()
    return data.first_name + " " + data.last_name
}

async function show_locations(){
    //This function demonstrates how to render a view that is created in Airtable. The list of locations is a view of the Store table in airtable. It is shared in Airtable. The ID of the share is all that is needed to display the share embedded in this webpage. Generally Airtable shared items are visible by anyone with the link or id, so any data that must be secured should not be rendered using this method. However, it is a quick and easy way to display data stored in airtable.
    const width = 400
    //here the HTML of the page is configured to display the shared view in airtable.
    tag("canvas").innerHTML=`<div class="center-screen"><iframe class="airtable-embed" src="https://airtable.com/embed/${show_locations_share}?backgroundColor=cyan" frameborder="0" onmousewheel="" width="${width}" height="500" style="background-color: white; border: 1px solid #ccc;"></iframe></div>`
    hide_menu()
}

async function request_time_off(){
    //This is an example of embedding a data form that is created in Airtable. This form allows a user to make a "time off" request. This form is not secure. Anyone with the link or the id for the form can use it to enter data into Airtable. However, it is easy to build and share an Airtable form. 
    if(!logged_in()){show_home();return}
    const width = 300
    //This form is configured to accept a parameter of the user that is requesting time off. All this means is that the Airtable form, when rendered, will populate with the appropriate user. The user can still change that information and request time off for any user stored in Airtable.
    const url=`https://airtable.com/embed/${request_time_off_share}?prefill_employee=${get_user_data().id}`
    console.log("url",url, get_user_data())
    tag("canvas").innerHTML=`<div class="center-screen"><iframe class="airtable-embed" src="${url}" frameborder="0" onmousewheel="" width="${width}" height="500" style="background-color: white; border: 1px solid #ccc;"></iframe></div>`
    hide_menu()
}

async function show_time_off(){
    //Another example of rendering data directly from Airtable. This function will display the time off requests for a particular employee
    if(!logged_in()){show_home();return}
    const width = 300
    const user_data = get_user_data()
    //notice the filter added to this URL. This filter will be applied to the table in Airtable and will only display the items defined by the filter.
    const url=`https://airtable.com/embed/${show_time_off_share}?filter_employee=${user_data.first_name}+${user_data.last_name}`
    console.log("url",url, get_user_data())
    tag("canvas").innerHTML=`<div class="center-screen"><iframe class="airtable-embed" src="${url}" frameborder="0" onmousewheel="" width="${width}" height="500" style="background-color: white; border: 1px solid #ccc;"></iframe></div>`
    hide_menu()
}

async function record_inventory(params){
    console.log('in record_inventory')

    if(!logged_in()){show_home();return}//in case followed a link after logging out. This prevents the user from using this feature when they are not authenticated.

    //First we hide the menu
    hide_menu()

    //This function is set up recursively to build the page for working with inventory. The first time the function is called, the HTML shell is created for displaying either the inventory form for recording the count or the inventory report. Note that this will only be built if there is a "style" property set when the function is called. Once the shell is created, the function is called again to either built the form for recording an inventory count or create the summary report.
    if(!params){
        //building the HTML shell
        tag("canvas").innerHTML=` 
            <div class="page">
                <div id="inventory-title" style="text-align:center"><h2>Ice Cream Inventory</h2></div>
                <div id="inventory-message" style="width:100%"></div>
                <div id="inventory_panel"  style="width:100%">
                </div>
            </div>  
        `
        //loading user data. Any user can record an inventory count, so we don't need to check their role at this point. If a user is associated with more than one store and they wish to record an inventory count, they will be prompted to select the store they want to work with.

        const user_data = get_user_data()
        console.log ("user_data",user_data)
        if(user_data.store.length===1){
            //If the user is associated with exactly 1 store, we call the get_inventory_list function again to populate the rest of the page with the data for that store. 
            tag("inventory-message").innerHTML='<i class="fas fa-spinner fa-pulse"></i>'//this element is used to add a visual element (spinning wheel) to signify that the site is processing.
            //we call the get_inventory_list function (mode) filtered to show only "Ice Cream" (filter) - note that there are other inventory items - in the store associated with this user (store).
            record_inventory({
                mode:"get_inventory_data",
                filter:"list='Ice Cream'",
                store:user_data.store[0]
            })
        }else{
            //We get here if the user is associated with more than 1 store. We build a form to have the user select the store they wish to work with.
            const html=['<form>Store: <select name="store">']
            for(store of user_data.store){
                html.push(`<option value="${store}">${store_list()[store]}</option>`)
            }
            //When the user selects the store using the form, the "get_inventory_list" function is invoked on the submission of the form to populate the rest of this page with the data for that store
            html.push(`</select>
                        <button type="button" id="choose_store_button" onclick="record_inventory(form_data(this,true))">Submit</button>
                        <input type="hidden" name="mode" value="get_inventory_data">
                        <input type="hidden" name="filter" value="list='Ice Cream'">
                        </form>`)
            tag("inventory_panel").innerHTML=html.join("")
        }

    }else{    
        //Notice that the first time through the store property is undefined and is set when the user data is loaded. Therefore this code will only process the second time through once the store property is set. During this pass, we determine whether to display the report of the last recorded inventory or display the form for recording a new inventory count.
        console.log("at ice_cream_inventory params=store")
        //we use a call to the "server_request" function to use Google App Script to retrieve the data needed to processs the form or the report
        
        const response=await server_request(params)
        tag("inventory-message").innerHTML=''




        if(response.status==="success"){//If the data is retrieved successfully, we proceed.
            
            //this is generating the form for updating inventory counts in an individual store
            // keep track of navigation
            window.rows={}
            window.cols={}
            console.log("response", response)
            // build the HTML header for the page identifying the store for which the counts will be recorded
            tag("inventory-title").innerHTML=`<h2>${store_list()[params.store]} Ice Cream Inventory</h2>`
            const html=["Fill in every row in this section."]
            //build the table for the form used to record the counts.
            const header=[`
            <table class="inventory-table">
                <tr>
                <th class="sticky" onclick="show_elements(['col-1','col-2','col-3'])">Flavor</th>
                `]
            let p=1 // map store ids to column numbers.  only needed for this loop then can be reused
            
            //add table headers for the "containers" (freezers) where inventory will be counted. Note that only the "Vineyard" location has a "Hardening Cabinet"
            for(container of response.list.records[0].fields.container){
                window.cols[p]=container
                window.cols[container]=p++
                let cont=container
                console.log("container",container)
                header.push(`<th onclick="hide_elements('col-${window.cols[container]}')" class="sticky col-${window.cols[container]}" >${cont}</th>`)
            }     
            header.push('<th class="sticky">Total</th></tr>')
            html.push(header.join(""))
            irregular=[]// ice cream not in regular category

            p=1// for keeping track of navigating rows.  can be reused after this loop
            for(record of response.list.records){
                // object to allow the navigation from row to row
                window.rows[p]=record.id
                window.rows[record.id]=p++

                //build the rest of the table for all of the regular ice cream items
                let target=html
                if(record.fields.category!=="Regular"){
                    target=irregular
                }
                //add a row for each flavor (record.field.name)
                target.push("<tr>")
                target.push(`<th>${record.fields.name}</th>`)
                //build a text input in each cell. Use the combination of the flavor and container ids as the identifier of the input so that we can use it to update the correct record. When a value in the input is change (onchange), the update_observation function is called and passed the value and information needed (store, flavor, and container) to add the observation to the database. update_observation is a function in Amazon App Script.
                for(container of record.fields.container){
                    target.push(`<td class="active col-${window.cols[container]}"><input id="${record.id}|${container.replace(/\s/g,"_")}" data-store="${params.store}" data-item_id="${record.id}" data-container="${container}" type="text" onchange="update_observation(this)"></td>`)
                }     
                target.push(`<td  class="inactive" id="${record.id}|total"></td></tr>`)//This sets the background color for items that have been updated to provide a visual cue that the element has been updated.
            }     
            html.push("</table>")
            //add form to collect observations for the irregular items
            html.push("<br>In this section, fill in only the rows corresponding to flavors you have on hand.")
            html.push(header.join(""))
            html.push(irregular.join(""))
            html.push("</table>")
            tag("inventory_panel").innerHTML=html.join("")

            // add quick buttons. The dipping cabinet locations can only have values of 0, 1/4, 1/2, 3/4, and 1. This will add buttons for inputs in the dipping cabinets.
            for(const [key,row] of Object.entries(window.rows)){
                if(isNaN(row)){
                    add_buttons(row,"Dipping Cabinet")
                }
            }

            const val_map={
                "0":0  ,
                "1":1  ,
                "2":2  ,
                "3":3  ,
                "4":4  ,
                "??":.25,
                "??":.5 ,
                "??":.75
            }

            // To the extent that observations may already exist for a flavor in that location in that store, they will be populated on the table. Changes to these values will also be updated.
            if(response.data.records){
                for(record of response.data.records){
                    const box=tag(record.fields.item[0] + "|" + record.fields.container.replace(/\s/g,"_"))
                    box.dataset.obs_id=record.id
                    box.value=record.fields.quantity
                    for(const div of getAllSiblings(box)){
                        // console.log(div.tagName,div.innerHTML,record.fields.quantity,val_map[div.innerHTML],record.fields.quantity===val_map[div.innerHTML])
                        if(div.tagName==="DIV" && record.fields.quantity===val_map[div.innerHTML]){
                            div.style.backgroundColor="lightGrey"
                            div.style.color="black"
                        }
                    }
                    box.parentElement.classList.add("inactive")
                    box.parentElement.classList.remove("active")
                }
            }

            // now that the data have been entered, total the rows. This will be updated every time a value is updated in the database.
            for(const [key,row] of Object.entries(window.rows)){
                if(isNaN(row)){
                    //console.log(row)
                    tag(row + "|total").innerHTML = flavor_total(row)
                }
            }

            tag("inventory_panel").addEventListener("keyup", function(event) {
                if (event.keyCode === 13) {
                    move_down(event.target);
                }
            });                
        }else{
            //This executes if the data needed to create the form or report is not retrieved successfully. It is essentially an error message to the user.
            tag("inventory_panel").innerHTML="Unable to get inventory list: " + response.message + "."
        }
    }
}

async function show_group_list(params){
    console.log('in show_group_list')

    if(!logged_in()){show_home();return}//in case followed a link after logging out. This prevents the user from using this feature when they are not authenticated.

    hide_menu()

    //build web page with Title, Info, and Content sections
    tag("canvas").innerHTML=` 
        <div class="page">
            <div id="group-title" style="text-align:center"><h2>Groups</h2></div>
            <div id="group-message" style="width:100%"></div>
            <div id="group_panel"  style="width:100%">
            </div>
        </div>  
    `

    //show spinner loading icon
    tag("group-message").innerHTML='<i class="fas fa-spinner fa-pulse"></i>'

    const response=await server_request({
        mode:"get_group_list"
    })
    //remove spinner icon
    tag("group-message").innerHTML=''

    console.log('group_list: ',response)

    if(response.status==="success"){//If the data is retrieved successfully, we proceed.
    
        tag("group-title").innerHTML='<h2>All Groups</h2>'
        //<CHANGEME>Build the table to display the groups.
        const html=[`
        <table class="inventory-table">
            <tr>
            <th class="sticky">Group ID</th>
            <th class="sticky">Group Type</th>
            <th class="sticky">Group Name</th>
            <th class="sticky">Description</th>
            <th class="sticky">Leader</th>
            <th class="sticky">Parent District</th>
            <th class="sticky">Parent Region</th>
            <th class="sticky">Actions</th>
            </tr>
            `] //Add other table columns here

    
        //processing the data to fit in the table
        for(record of response.data){
            let target=html
            //add a new table row to the table for each record
            target.push("<tr>")

            //Group ID
            target.push(`<td style="text-align:center">${record.fields.group_id}</td>`)
            
            //Group Type
            target.push(`<td style="text-align:left">${record.fields.type}</td>`)
            
            //Group Name
            target.push(`<td style="text-align:left">${record.fields.group_name}</td>`)

            //Group Description
            target.push(`<td style="text-align:left">${record.fields.group_desc}</td>`)

            //Leader ID
            if (record.fields.leader){
                target.push(`<td style="text-align:left">${record.fields.leader[0]}</td>`)
            } else target.push("<td></td>")

            //Parent Groups
            if (record.fields.type === "Region") {
                target.push("<td></td><td></td>")
            } else if (record.fields.type === "District") {
                target.push("<td></td>")
                target.push(`<td style="text-align:left">${record.fields.region_name}</td>`)
            } else {
                target.push(`<td style="text-align:left">${record.fields.district_name}</td>`)
                target.push(`<td style="text-align:left">${record.fields.region_name}</td>`)
            }

            //Actions
            target.push("<td>")
                target.push(`<a class="tools" onclick="view_group_members(${record.fields.group_id}, '${record.fields.type}')">View Members</a>`)
            target.push("</td>")

            //close row
            target.push("</tr>")
        }
        html.push("</table>")
        tag("group_panel").innerHTML=html.join("")
    }else{
        //This executes if the data needed to create the form or report is not retrieved successfully. It is essentially an error message to the user.
        tag("group_panel").innerHTML="Unable to get group list: " + response.message + "."        
    }
}

//user_list_function

async function show_user_list(params){
    console.log('in show_user_list')

    if(!logged_in()){show_home();return}//in case followed a link after logging out. This prevents the user from using this feature when they are not authenticated.

    hide_menu()

    //build web page with Title, Info, and Content sections
    tag("canvas").innerHTML=` 
        <div class="page">
            <div id="group-title" style="text-align:center"><h2>Members</h2></div>
            <div id="group-message" style="width:100%"></div>
            <div id="group_panel"  style="width:100%">
            </div>
        </div>  
    `

    //show spinner loading icon
    tag("group-message").innerHTML='<i class="fas fa-spinner fa-pulse"></i>'

    const response=await server_request({
        mode:"get_user_list" //need to fix to user_list
    })
    //remove spinner icon
    tag("group-message").innerHTML=''

    console.log('members_list: ',response)


    if(response.status==="success"){//If the data is retrieved successfully, we proceed.
    


        tag("group-title").innerHTML=`<h2>All members</h2><p><input type="text" id="tableinput" onkeyup="filtertable(4,'tableinput')" placeholder="Search for table" title="search"> <input type="text" id="districtinput" onkeyup="filtertable(5,'districtinput')" placeholder="Search for district" title="search"><input type="text" id="regioninput" onkeyup="filtertable(6,'regioninput')" placeholder="Search for region" title="search">`
        
        //<CHANGEME>Build the table to display the groups.
        const html=[`
        <table id="allmembers" class="inventory-table">
            <tr>
            <th class="sticky">First Name</th>
            <th class="sticky">Last Name</th>
            <th class="sticky">Phone Number</th>
            <th class="sticky">Email</th>
            <th class="sticky">Table</th>
            <th class="sticky">District</th>
            <th class="sticky">Region</th>
            <th class="sticky">Actions</th>
            </tr>
            `] //Add other table columns here

    
        //processing the data to fit in the table
        for(record of response.data){
            let target=html
            //add a new table row to the table for each record
            target.push("<tr>")

            //Members First Name
            target.push(`<td style="text-align:center">${record.fields.first_name}</td>`)
            
            //Members Last Name
            target.push(`<td style="text-align:left">${record.fields.last_name}</td>`)
            
            //Members Phone Number
            target.push(`<td style="text-align:left">${record.fields.phone}</td>`)

            //Members Email
            target.push(`<td style="text-align:left">${record.fields.email}</td>`)

            //Members Table
            target.push(`<td style="text-align:left">${record.fields.table}</td>`)

            //Members Disctrict
            target.push(`<td style="text-align:left">${record.fields.district}</td>`)

            //Members Region
            target.push(`<td style="text-align:left">${record.fields.region}</td>`)

            //Actions
            target.push("<td>")
                target.push(`<a class="tools" onclick="">Update Contact Info</a>`)
            target.push("</td>")

            //close row
            target.push("</tr>")
        }
        html.push("</table>")
        tag("group_panel").innerHTML=html.join("")
    }else{
        //This executes if the data needed to create the form or report is not retrieved successfully. It is essentially an error message to the user.
        tag("group_panel").innerHTML="Unable to get group list: " + response.message + "."        
    }
}

async function view_group_members(group_id, group_type){
    console.log(`in view_group_members. Group ID: ${group_id}, Group Type: ${group_type}`)

    if(!logged_in()){show_home();return}//in case followed a link after logging out. This prevents the user from using this feature when they are not authenticated.

    hide_menu()

    //build web page with Title, Info, and Content sections
    tag("canvas").innerHTML=` 
        <div class="page">
            <div id="members-title" style="text-align:center"><h2>Groups</h2></div>
            <div id="members-message" style="width:100%"></div>
            <div id="members_panel"  style="width:100%">
            </div>
        </div>  
    `

    //show spinner loading icon
    tag("members-message").innerHTML='<i class="fas fa-spinner fa-pulse"></i>'

    const response=await server_request({
        mode:"get_group_members",
        group: group_id
    })
    //remove spinner icon
    tag("members-message").innerHTML=''

    console.log('membership list: ',response)

    if(response.status === "success") {
        
        tag("members-title").innerHTML=`<h2>"${response.group_data[0].fields.group_name}" ${response.group_data[0].fields.type} Membership</h2>`
        //<CHANGEME>Build the table to display the groups.
        const is_admin=intersect(get_user_data().roles, ["administrator"]).length>0
        const html=[`
        <table class="inventory-table">
            <tr>
            <th class="sticky">Name</th>
            <th class="sticky" id="Region">Region</th>
            <th class="sticky" id="District">District</th>
            <th class="sticky" id="Table">table</th>
            <th class="sticky">Actions</th>
            </tr>
            `] //Add other table columns here

        //processing the data to fit in the table
        for(record of response.member_data){
            //for each new record, create new row
            let target=html;
            target.push("<tr>")

            //Name
            target.push(`<td style="text-align: left">${record.fields.Name}</td>`)

            //Table
            target.push(`<td style="text-align: left">${record.fields.region}</td>`)

            //District
            target.push(`<td style="text-align: left">${record.fields.district}</td>`)

            //Region
            target.push(`<td style="text-align: left">${record.fields.table}</td>`)

            //actions
            target.push(`<td style="text-align: left">`)
                if (record.fields.Name != (get_user_name()) || is_admin) {
                    target.push(`<a class="tools" onclick="move_member({user_id:'${record.fields.uuid}'})">Move Member</a>`) //({email:'${record.fields.email}',
                }
            target.push(`</td>`)

            //close row
            target.push("</tr>")
        }
        html.push("</table>")
        tag("members_panel").innerHTML=html.join("")
        tag("members-message").innerHTML=`<a class="tools"onclick=show_group_list()>Return to All Groups</a>`

        //color the header of the current group
        switch(group_type) {
            case "Table":
                tag("Table").style.backgroundColor="lightgreen"
                break
            case "District":
                tag("District").style.backgroundColor="lightgreen"
                break
            case "Region":
                tag("Region").style.backgroundColor="lightgreen"
                break
        }

        tag(`${group_type}`).innerHTML=`<th class="sticky" id=${group_type} style="color:light-green">${group_type}</th>`
    }else{
        //This executes if the data needed to create the form or report is not retrieved successfully. It is essentially an error message to the user.
        tag("members_panel").innerHTML="Unable to get membership records: " + response.message + "."        
    }
}

async function manage_my_group(params) {
    console.log('in manage_my_group')

    if(!logged_in()){show_home();return}//in case followed a link after logging out. This prevents the user from using this feature when they are not authenticated.

    hide_menu()

    //build web page with Title, Info, and Content sections
    tag("canvas").innerHTML=` 
        <div class="page">
            <div id="management-title" style="text-align:center"><h2>My Group</h2></div>
            <div id="management-message" style="width:100%"></div>
            <div id="management_panel"  style="width:100%">
            </div>
        </div>  
    `

    //show spinner loading icon
    tag("management-message").innerHTML='<i class="fas fa-spinner fa-pulse"></i>'

    const user_data = get_user_data()
    console.log(user_data)

    const response=await server_request({
        mode:"get_group_members", //the name of a function in app.gs on GAS
        user: user_data.user_id,
        group: ''
    })
    //remove spinner icon
    tag("management-message").innerHTML=''

    console.log('My Group Info: ',response)

    if(response.status === "success") {

        const is_admin=intersect(get_user_data().roles, ["administrator"]).length>0
        
        tag("management-title").innerHTML=`<h2>"${response.group_data[0].fields.group_name}" ${response.group_data[0].fields.type} Membership</h2>`
        //<CHANGEME>Build the table to display the groups.
        const html=[`
        <table class="inventory-table">
            <tr>
            <th class="sticky">Name</th>
            <th class="sticky" id="Region">Region</th>
            <th class="sticky" id="District">District</th>
            <th class="sticky" id="Table">table</th>
            <th class="sticky">Actions</th>
            </tr>
            `] //Add other table columns here

        //processing the data to fit in the table
        for(record of response.member_data){
            //for each new record, create new row
            let target=html;
            target.push("<tr>")

            //Name
            target.push(`<td style="text-align: left">${record.fields.Name}</td>`)

            //Table
            target.push(`<td style="text-align: left">${record.fields.region}</td>`)

            //District
            target.push(`<td style="text-align: left">${record.fields.district}</td>`)

            //Region
            target.push(`<td style="text-align: left">${record.fields.table}</td>`)

            //actions
            target.push(`<td style="text-align: left">`)
                if (record.fields.Name != (get_user_name()) || is_admin) {
                    target.push(`<a class="tools" onclick="move_member({user_id:'${record.fields.uuid}'})">Move Member</a>`) //({email:'${record.fields.email}',
                }
            target.push(`</td>`)

            //close row
            target.push("</tr>")
        }
        html.push("</table>")
        tag("management_panel").innerHTML=html.join("")
    }else{
        //This executes if the data needed to create the form or report is not retrieved successfully. It is essentially an error message to the user.
        tag("management_panel").innerHTML="Unable to get group list: " + response.message + "." //<CHANGEME> to panel name
    }
}

async function move_member(params) {
    console.log('in move_member')

    if(!logged_in()){show_home();return}//in case followed a link after logging out. This prevents the user from using this feature when they are not authenticated.

    hide_menu()

    //build web page with Title, Info, and Content sections
    tag("canvas").innerHTML=` 
        <div class="page">
            <div id="move-title" style="text-align:center"><h2>Initiating User Move</h2></div>
            <div id="move-message" style="width:100%"></div>
            <div id="move_panel"  style="width:100%">
            </div>
        </div>  
    `

    //show spinner loading icon
    tag("move-message").innerHTML='<i class="fas fa-spinner fa-pulse"></i>'

    const response=await server_request({
        mode:"move_form_data", //the name of a function in app.gs on GAS
        user_id: params.user_id
    })
    //remove spinner icon
    tag("move-message").innerHTML='' 

    console.log('Move Form Information: ',response)

    if(response.status==="success"){//If the data is retrieved successfully, we proceed.
        const user_data = get_user_data()

        tag("move-title").innerHTML=`<h2>Moving ${response.member_data[0].fields.Name}</h2>`
        const form=[`
        <form>
        <input type=hidden name="mode" value="submit_move">
        <input type=hidden name="user_id" value='${response.member_data[0].fields.uuid}'><br>`]

        //show region section if authorized
        if (intersect(user_data.roles, ["administrator"]).length>0){
            form.push("New Region: <select name='region' id='region'>")
            for(region of response.group_data.regions){
                if (region.fields.group_name === response.member_data[0].fields.region[0]) { //if current region is user's region
                    form.push(`<option value="${region.fields.group_id}" selected>${region.fields.group_name}</option>`)
                } else {
                    form.push(`<option value="${region.fields.group_id}">${region.fields.group_name}</option>`)
                }
            }
            form.push("</select><br><br>")
        } else {
            form.push(`<input type=hidden name='region_hid' id='region_hid' value = ${response.member_data[0].fields.region}>`)
        }

        //show district section if authorized
        if (intersect(user_data.roles, ["administrator", "region_leader"]).length>0) {
            form.push(`New District: <select name='district' id='district'>`)
            for(district of response.group_data.districts){
                if(district.fields.region_name[0] === response.member_data[0].fields.region[0]) {
                    if (district.fields.group_name === response.member_data[0].fields.district[0]) {
                        form.push(`<option value="${district.fields.group_id}" selected>${district.fields.group_name}</option>`)
                    } else {
                        form.push(`<option value="${district.fields.group_id}">${district.fields.group_name}</option>`)
                    }
                }
            }
            form.push("</select><br><br>")
        }else {
            form.push(`<input type=hidden name='district_hid' id='district_hid' value = ${response.member_data[0].fields.district}>`)
        }

        //show table section
        if(intersect(user_data.roles, ["administrator", "region_leader", "district_leader"]).length>0) {
            form.push("New Table: <select name='table' id='table'>")
            for(table of response.group_data.tables){
                if(table.fields.district_name[0] === response.member_data[0].fields.district[0]) {
                    if (table.fields.group_name === response.member_data[0].fields.table[0]) {
                        form.push(`<option value="${table.fields.group_id}" selected>${table.fields.group_name}</option>`)
                    } else {
                        form.push(`<option value="${table.fields.group_id}">${table.fields.group_name}</option>`)
                    }
                }
            }
            form.push("</select><br><br>")
        } else {
            form.push(`<input type=hidden name='table_hid' id='table_hid' value = ${response.member_data[0].fields.table}>`)
        }

        form.push(`<button type="button" id="submit_user_move" onclick="submit_move(form_data(this,true))">Submit</button>`)
        form.push(`&nbsp;&nbsp;<button type="button" id="cancel" onclick="manage_my_group()">Cancel</button>`)
        
        //close form
        form.push("</form>")
        tag("move_panel").innerHTML=form.join("")

        //create onchange functions for region and district
        var region_select = tag('region')
        var district_select = tag('district')
        var table_select = tag('table')

        region_select.onchange = function() {
            //clear district & table values
            district_select.length = 0
            table_select.length = 0

            //replace district values
            for (district of response.group_data.districts) {
                if (district.fields.region_name[0] === region_select.options[region_select.selectedIndex].innerText) {
                    district_select.options[district_select.options.length] = new Option(district.fields.group_name, district.fields.group_id)
                }
            }

            //replace table values
            for (table of response.group_data.tables) {
                if (table.fields.district_name[0] === district_select.options[district_select.selectedIndex].innerText) {
                    table_select.options[table_select.options.length] = new Option(table.fields.group_name, table.fields.group_id)
                }
            }
        }
        district_select.onchange = function() {
            //clear table values
            table_select.length=0

            //replace table values
            for (table of response.group_data.tables) {
                if (table.fields.district_name[0] === district_select.options[district_select.selectedIndex].innerText) {
                    table_select.options[table_select.options.length] = new Option(table.fields.group_name, table.fields.group_id)
                }
            }
        }
    }else{
        //This executes if the data needed to create the form or report is not retrieved successfully. It is essentially an error message to the user.
        tag("move_panel").innerHTML="Unable to initiate user move: " + response.message.error.type + "." + response.message.error.message
    }
}

async function submit_move(params){
    console.log("In submit_move", params)

    const response=await server_request(params)

    if (!(response.status === "success")) {
        alert("Move rejected: ", response.message.error.type + ".\n" + response.message.error.message)
    }

    navigate({fn:'manage_my_group'})
}

async function show_inventory_summary(params){
    console.log('in show_inventory_summary')
    //this function is used both the record inventory counts and to build a summary report. The "style" property of the params sent to the function determines whether the function is in "count" mode or "summary" mode. Also, if the user has access to multiple stores, they will be presented with the option to select the store they wish to work with.

    if(!logged_in()){show_home();return}//in case followed a link after logging out. This prevents the user from using this feature when they are not authenticated.

    //First we hide the menu
    hide_menu()
    //This function is set up recursively to build the page for working with inventory. The first time the function is called, the HTML shell is created for displaying either the inventory form for recording the count or the inventory report. Note that this will only be built if there is a "style" property set when the function is called. Once the shell is created, the function is called again to either built the form for recording an inventory count or create the summary report.
    //building the HTML shell
    tag("canvas").innerHTML=` 
        <div class="page">
            <div id="inventory-title" style="text-align:center"><h2>Ice Cream Inventory</h2></div>
            <div id="inventory-message" style="width:100%"></div>
            <div id="inventory_panel"  style="width:100%">
            </div>
        </div>  
    `
    //loading user data. Any user can record an inventory count, so we don't need to check their role at this point. If a user is associated with more than one store and they wish to record an inventory count, they will be prompted to select the store they want to work with.

    const user_data = get_user_data()
    console.log ("user_data",user_data)
    //If the user wants to see a summary of the most recent count, we call the "get_inventory_summary" function to populate the page with data from all of the stores that are associated with that user.
    tag("inventory-message").innerHTML='<i class="fas fa-spinner fa-pulse"></i>'
    
    const response=await server_request({
        mode:"get_inventory_summary",
        filter:"list='Ice Cream'",
        store:user_data.store,
    })
    tag("inventory-message").innerHTML=''

    if(response.status==="success"){//If the data is retrieved successfully, we proceed.
    
        //If the style property is set to "summary", we build the report of the most recent count.

        console.log("response", response)
        //build the HMTL heading for the report
        tag("inventory-title").innerHTML=`<h2>Ice Cream Inventory Summary</h2>`


        //Build the table to display the report. The columns of the table are: Flavor, the stores available to the user, and the total inventory. Since only the owner is given the option to view inventory counts (see the autheticated_user global variable), all stores will be shown in the report.
        const header=[`
        <table class="inventory-table">
            <tr>
            <th class="sticky">Flavor</th>
            `]

        for(const [key,val] of Object.entries(store_list())){
            if(key.indexOf("rec")===0){
                header.push(`<th class="sticky">${val}</th>`)
            }
        }

        header.push(`<th class="sticky">Total</th>`)
        header.push("</tr>")
        const html=[header.join("")]

        irregular=[]// used for icecream that is not in regular category

        //processing the data to fit in the table
        for(record of response.list.records){
            let target=html
            if(record.fields.category!=="Regular"){
                target=irregular
            }
            //add a new table row to the table for each flavor
            target.push("<tr>")
            //insert the flavor name (record.field.name)
            target.push(`<td style="text-align:left">${record.fields.name}</td>`)
            //create empty cells in the table for the inventory counts. Notice that the ID for the empty cell is set to be a combination of the id for the flavor (record.id) and the store (stores[store]) corresponding to the column. This way the table can be populated with the correct data in the correct cells.

            for(const [key,val] of Object.entries(store_list())){
                if(key.indexOf("rec")===0){
                    target.push(`<td id="${record.id}|${key}"></td>`)
                }
            }

            //The totals will be calculated. The id is set to a combination of the flavor id and "total" so that the appropriate totals can be placed correctly in the table. 
            target.push(`<td id="${record.id}|total"></td>`)
            target.push("</tr>")
        }     

        //this adds a table for the "irregular" items that might be counted.
        html.push("</table><br>")
        html.push(header.join(""))
        html.push(irregular.join(""))
        html.push("</table>")
        tag("inventory_panel").innerHTML=html.join("")


        // find the most recent numbers for each store
        const data={}
        //if there is data to display, proceed
        if(response.data.records){
            //process through each available data item
            for(record of response.data.records){
                //identity the flavor/store combination for each observation
                const id = record.fields.item[0] + "|" + record.fields.store[0]
                //Since the data is ordered by date, if we have already found an observation for a flavor/store combination, any additional obeservations are skipped.
                if(!data[id]){
                    data[id]={quantity:record.fields.quantity,date:record.fields.date}
                }
            }

            // now fill the table with the most recent observations found for each flavor/store combination
            for(const[key,value] of Object.entries(data)){
                //create "boxes" for the store observations and totals of each flavor based on the identifiers already created for the individual cells (id's of the <td> tags)
                const total_box = tag(key.split("|")[0] + "|total")
                const box = tag(key)
                //There will be more than one current observation for a flavor in each store, so we need to total these observations by store. To do this, if there is not currently a value in the table for flavor/store, it is added. If there is an observation, the new observation is added to the one that is currently there (running total logic).
                if(box.innerHTML===""){
                    box.innerHTML=value.quantity
                }else{
                    box.innerHTML=parseFloat(box.innerHTML)+value.quantity
                }
                //similar logic is used to build running totals for the grand total column.
                if(total_box.innerHTML===""){
                    total_box.innerHTML=value.quantity
                }else{
                    total_box.innerHTML=parseFloat(total_box.innerHTML)+value.quantity
                }

            }
        }
        
    }else{
        //This executes if the data needed to create the form or report is not retrieved successfully. It is essentially an error message to the user.
        tag("inventory_panel").innerHTML="Unable to get inventory list: " + response.message + "."        
    }

}


function add_buttons(row,col){
    //this function is used to create the input buttons for recording the inventory observations. Notice that we only use the options for case 3. We might use the other options in the future.
    const box = tag(row + "|" + col.replace(/\s/g,"_"))    
    const container = box.parentElement
    switch(window.cols[col]){
        case 3:
            box.style.display="none"
            container.appendChild(get_div_button(box,"20%",0,"0"))
            container.appendChild(get_div_button(box,"20%",.25,"&#188;"))
            container.appendChild(get_div_button(box,"20%",.5,"&#189;"))
            container.appendChild(get_div_button(box,"20%",.75,"&#190;"))
            container.appendChild(get_div_button(box,"20%",1,"1"))
            break;
        case 2:
            box.style.width="30px"
            container.prepend(get_div_button(box,"15%",2))
            container.prepend(get_div_button(box,"15%",1))
            container.prepend(get_div_button(box,"15%",0))
            break
        case 1:
            box.style.width="30px"
            container.prepend(get_div_button(box,"15%",4))
            container.prepend(get_div_button(box,"15%",3))
            container.prepend(get_div_button(box,"15%",2))
            container.prepend(get_div_button(box,"15%",1))
            container.prepend(get_div_button(box,"15%",0))
            break
        }
}

function get_div_button(box,width,value,label){
    //This sets the color of the buttons to grey when they are selected to visually show that the value has been entered for that item.
    if(label===undefined)(label=value)
    const div=document.createElement('div')
    div.addEventListener("click",async function(event){
        box.value=value
        if(await update_observation(box)){
            for(const div of getAllSiblings(this)){
                if(div.tagName==="DIV"){
                    div.style.backgroundColor="transparent"
                    div.style.color="lightGray"
                    console.log(div)
                }
            }
            this.style.backgroundColor="lightGray"
            this.style.color="black"
        }
    })
    div.style.height="100%"
    div.style.display="inline-block"
    div.style.width=width
    div.style.textAlign="center"
    div.style.borderRadius="50%"
    div.style.color="lightgrey"
    div.innerHTML=label
    
    return div
}


function move_down(source){
    // aids in navigation. selects the next cell below when a value is updated
    const ids=source.id.split("|")
    ids[1]=ids[1].replace(/_/g," ")
    
    let next_flavor=window.rows[window.rows[ids[0]]+1]
    let next_container=ids[1]
    if(!next_flavor){
        next_flavor=window.rows[1]
        next_container = window.cols[window.cols[next_container]+1]
        if(!next_container){
            next_container=window.cols[1]
        }
    }
    tag(next_flavor + "|" + next_container.replace(/\s/g,"_")).focus()
}

function flavor_total(flavor_id){
    //used to calculate the running total for observations as they are entered into the input form
    let flavor_total=0
    for(const key of Object.keys(window.cols)){
        if(isNaN(key)){
           // console.log(flavor_id + "|" + key.replace(/\s/g,"_"))
            flavor_total += parseFloat(tag(flavor_id + "|" + key.replace(/\s/g,"_")).value) || 0
        }
    }
    return flavor_total
}

async function update_observation(entry){
    //this is the function that is called to update an observation when the value is change in the input form.
    //console.log(entry.parentElement)

    if(entry.parentElement.classList.contains("working")){
        // don't allow a cell currently posing to be edited.
        return
    }

    if(!logged_in()){show_home();return}//If the user logs out, not updates are permitted.
    // add data validation. If a values that is not a number has been entered, the cell is highlighted in gray and an error message is presented to the user. No update will be made.
    if(isNaN(entry.value)){
        entry.parentElement.style.backgroundColor="lightGray"
        message({
            message:"Please enter a number",
            title:"Data Error",
            kind:"error",
            seconds:5    
        })
        entry.focus()
        entry.select()

        return
    }
    //We get here if value data has been entered in an input box.
    const flavor_id = entry.id.split("|")[0] //grab the identifier for the flavor
    //build an object with the flavorID, store, container, and quantity to be updated.
    const params={
        item_id:entry.dataset.item_id,
        quantity:entry.value,
        container:entry.dataset.container,
        store:entry.dataset.store,
    }
    //visually signal by modifying the appearance of the cell that the value is currently being updated.
    entry.parentElement.style.backgroundColor=null
    entry.parentElement.classList.add("working")
    
    if(entry.dataset.obs_id){
        // there is already a record for this item.  update it
        params.mode="update_inventory_count"
        params.obs_id=entry.dataset.obs_id
        console.log("updating", params.obs_id)
        //use the server_request function to update the value (the update_inventory_count function in google app script is called and the appropriate flavor, store, container, and quantity information is passed)
        const response=await server_request(params)    
        console.log("update response", response)
        
        if(response.status==="success"){//if the value is successfully updated, the appearance of the cell is changed to reflect the update.
            console.log("updated", flavor_total)
            tag(flavor_id + "|total").innerHTML = flavor_total(flavor_id)
            entry.parentElement.classList.remove("working")
            entry.parentElement.classList.remove("active")
            entry.parentElement.classList.add("inactive")
            entry.dataset.obs_id=response.records[0].id
            return true
        }else{//if the value is not successfully updated, the appearance of the cell is changed to reflect an error and an error message is presented to the user.
            entry.style.backgroundColor="red"
            message({
                message:"Inventory Not Recorded: " + response.message,
                title:"Data Error",
                kind:"error",
                seconds:5    
            })
            return false
        }

    }else{
        // there is no record for this item, insert it using the "insert_inventory_count" function in google app script
        params.mode="insert_inventory_count"
        console.log("inserting")
        const response=await server_request(params)    
        console.log("insert response", response)
        
        if(response.status==="success"){//If it is inserted correctly, the appearance of the cell is changed to reflect the update.
            tag(flavor_id + "|total").innerHTML = flavor_total(flavor_id)
            entry.parentElement.classList.remove("working")
            entry.parentElement.classList.remove("active")
            entry.parentElement.classList.add("inactive")
            entry.dataset.obs_id=response.records[0].id
            return true
        }else{//If it is not inserted correctly, the appearance of the cell is changed to reflect the error and the error message is presented.
            entry.style.backgroundColor="red"
            message({
                message:"Inventory Not Recorded: " + response.message.message,
                title:"Data Error",
                kind:"error",
                seconds:5    
            })
            }
            return false
    }
}


async function employee_list(){
    //this function displays an employee list. If the user role allows, the option to update the user record in Google App Script is presented
    //Note: user information is stored in Airtable. However, to avoid the need to repeatedly access Airtable to retrieve user information, a record is stored in Google App Script. This record must be updated when changes are made to user information in Airtable, thus the need for user information to be updated.
    if(!logged_in()){show_home();return}//in case followed a link after logging out
    hide_menu()
    //Build the HTML placeholders for the employee data.
    tag("canvas").innerHTML=` 
    <div class="page">
        <h2>Member List</h2>
        <div id="member-list-message" style="padding-top:1rem;margin-bottom:1rem">
        Member contact information is private and should not be shared.
        </div>
        <div id="employee_list_panel">
        <i class="fas fa-spinner fa-pulse"></i>
        </div>
    </div>
    `
    
    //retrieve the employee data using the local server_request function to request the Google App Script function "employee_list" retrieve the employee data.
    const response=await server_request({
        mode:"employee_list",
        filter:""
    })

    //build the standard headers for the employee table
    const labels={
        first_name:"First Name",
        last_name:"Last Name",
        email:"Email",
        phone:"Phone",
    }

    //determine if the user has a role that allows for employee updates.
    const is_admin=intersect(get_user_data().roles, ["administrator"]).length>0

    if(response.status==="success"){
        const html=['<table style="background-color:white"><tr>']
        //add the standard headers to the table
        for(const field of response.fields){
            html.push("<th>")
            html.push(labels[field])
            html.push("</th>")
        }
        //If the role is sufficient to perform employee updates, add the header "Action"
        if(is_admin){html.push("<th>Action</th>")}
        html.push("</tr>")

        //process through the employee records that were returned and add them to the table.
        for(const record of response.records){
            html.push("<tr>")
            console.log(record)
            for(const field of response.fields){
                if(record.fields[field]==="withheld"){
                  html.push('<td style="color:lightgray">')
                }else{
                  html.push("<td>")
                }
                html.push(record.fields[field])
                html.push("</td>")
            }
            //If the user is able to perform employee updates, add a button that allows them update employees
            if(is_admin){
                html.push("<td>")
                    html.push(`<a class="tools" onclick="update_user({email:'${record.fields.email}', button:'Update User', mode:'update_user'},tag('member-list-message'))">Update</a>`)
                html.push("</td>")
            }
            html.push("</tr>")
        }
        html.push("</table>")
    
        tag("employee_list_panel").innerHTML=html.join("")
    
    }else{
        tag("employee_list_panel").innerHTML="Unable to get member list: " + response.message + "."
    }    

}

async function add_member(params){
    console.log('in add_member')

    if(!logged_in()){show_home();return}//in case followed a link after logging out. This prevents the user from using this feature when they are not authenticated.

    hide_menu()

    //build web page with Title, Info, and Content sections
    tag("canvas").innerHTML=` 
    <form>
        <div class="page">
            <div id="group-title" style="text-align:center"><h2>Add Member</h2></div>
            <div id="group-message" style="width:100%">Please enter in new member information.</div>
            <div id="group_panel"  style="width:100%">
            <br>
            <label><b>First Name</b></label> <input type="text" name="first_name" id="first_name"> <br>
            <label><b>Last Name</b></label> <input type="text" name="last_name" id="last_name">  <br>
            <label><b>Email</b></label> <input type="email" name="email" id="email">  <br>
            <label><b>Address</b></label> <input type="text" name="addr" id="addr">  <br>
            <label><b>Phone</b></label> <input type="tel" name="phone" id="phone">  <br>
            <input type="hidden" name="mode" value="add_member">
            </div>
            <button type="button" onclick=gas_add_member(form_data(this,true))>Submit</button> 
        </div> 
    </form> 
    `

}

async function gas_add_member(params) {
  const response=await server_request(params)
  add_member()
if (response.status==="success") {
    alert("Member Added Successfully")
}
    else{ alert(response.message)}

}

//Function for the search bar

function filtertable(columnnumber,inputid) {
    console.log("infiltertable inputid:",inputid)
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById(inputid);
    filter = input.value.toUpperCase();
    table = document.getElementById("allmembers");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[columnnumber];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }       
    }
  }
