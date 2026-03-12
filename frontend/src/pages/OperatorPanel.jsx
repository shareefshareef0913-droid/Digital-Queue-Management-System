import { useState, useEffect } from "react"
import { getOrganizations, getCounters, callNext, completeToken, getQueue } from "../services/api"

function OperatorPanel(){

const [organizations,setOrganizations] = useState([])
const [org,setOrg] = useState("")

const [counters,setCounters] = useState([])
const [counter,setCounter] = useState("")

const [currentToken,setCurrentToken] = useState(null)



// load organizations
useEffect(()=>{

getOrganizations()
.then(res=>{
setOrganizations(res.data)
})
.catch(()=>{
alert("Failed to load organizations")
})

},[])



// load current serving token
useEffect(()=>{

loadServing()

},[])



const loadServing = ()=>{

getQueue()
.then(res=>{

if(res.data.serving){
setCurrentToken(res.data.serving.token_number)
}

})

}



// load counters when organization selected
const selectOrganization = (id)=>{

setOrg(id)

if(!id){
setCounters([])
return
}

getCounters(id)
.then(res=>{
setCounters(res.data)
})
.catch(()=>{
alert("Failed to load counters")
})

}



// call next token
const nextToken = ()=>{

if(!org){
alert("Select organization first")
return
}

if(!counter){
alert("Select counter first")
return
}

callNext({
counter:counter,
organization:org
})
.then(res=>{
setCurrentToken(res.data.token)
})
.catch(err=>{

if(err.response){
alert(err.response.data.message)
}else{
alert("Server error")
}

})

}



// complete token
const finishToken = ()=>{

if(!currentToken){
alert("No token serving")
return
}

completeToken({token:currentToken})
.then(()=>{
alert("Service Completed")
setCurrentToken(null)
})
.catch(()=>{
alert("Error completing token")
})

}



return(

<div className="container">

<h2 className="panel-title">Operator Panel</h2>


{/* ORGANIZATION */}

<div className="section">

<h3>Select Organization</h3>

<select
className="organization-select"
value={org}
onChange={(e)=>selectOrganization(e.target.value)}
>

<option value="">Select Organization</option>

{organizations.map(o=>(
<option key={o.id} value={o.id}>
{o.name}
</option>
))}

</select>

</div>



{/* COUNTER */}

<div className="section">

<h3>Select Counter</h3>

<select
className="counter-dropdown"
value={counter}
onChange={(e)=>setCounter(e.target.value)}
>

<option value="">Select Counter</option>

{counters.map(c=>(
<option key={c.id} value={c.id}>
{c.counter_name}
</option>
))}

</select>

</div>



{/* ACTION BUTTONS */}

<div className="operator-actions">

<button className="call-btn" onClick={nextToken}>
Call Next Token
</button>

<button className="complete-btn" onClick={finishToken}>
Complete Service
</button>

</div>



{/* CURRENT TOKEN */}

{currentToken &&

<div className="serving-box">

<h3>Now Serving</h3>
<h1>{currentToken}</h1>

</div>

}

</div>

)

}

export default OperatorPanel;