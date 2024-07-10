import React, { useState } from "react";
import "./ConferenceEvent.css";
import TotalCost from "./TotalCost";
import { useSelector, useDispatch } from "react-redux";
import { incrementQuantity, decrementQuantity } from "./venueSlice";
import { incrementAvQuantity, decrementAvQuantity } from "./avSlice";
import { toggleMealSelection } from "./mealsSlice";

const ConferenceEvent = () => {
    const [showItems, setShowItems] = useState(false);
    const [numberOfPeople, setNumberOfPeople] = useState(1);
    
    const dispatch = useDispatch();

    // ADD-REMOVE VENUE ROOM
    const venueItems = useSelector((state) => state.venue); //retrieves venue items from the Redux store state.

    const remainingAuditoriumQuantity = 3 - venueItems.find(item => item.name === "Auditorium Hall (Capacity:200)").quantity;
    //the remaining number of available auditorium halls to three, so the user cannot request more than three

    const handleAddToCart = (index) => {
      if (venueItems[index].name === "Auditorium Hall (Capacity:200)" && venueItems[index].quantity >= 3) {
        return; 
      }
      dispatch(incrementQuantity(index));
    };
    const handleRemoveFromCart = (index) => {
      if (venueItems[index].quantity > 0) {
        dispatch(decrementQuantity(index));
      }
    };
    
    // ADD-REMOVE AV ITEM
    const avItems = useSelector((state) => state.av); //Import the add-on items from store.js where avSlice.js sends the details using reducers

    const handleIncrementAvQuantity = (index) => {
      dispatch(incrementAvQuantity(index));
    };
    const handleDecrementAvQuantity = (index) => {
      dispatch(decrementAvQuantity(index));
    };
    
    // ADD MEALS
    const mealsItems = useSelector((state) => state.meals); //Import the meal items from store.js where mealsSlice.js sends the details using reducers
    
    const handleMealSelection = (index) => {
      const item = mealsItems[index];
      if (item.selected && item.type === "mealForPeople") {
          // Ensure numberOfPeople is set before toggling selection
          const newNumberOfPeople = item.selected ? numberOfPeople : 0;
          dispatch(toggleMealSelection(index, newNumberOfPeople));
      }
      else {
          dispatch(toggleMealSelection(index));
      }
    };

    // TOTAL SELECTED ITEMS COST
    const calculateTotalCost = (section) => { 
        let totalCost = 0;
        if (section === "venue") { //cost for all selected rooms
          venueItems.forEach((item) => {
            totalCost += item.cost * item.quantity;
          });
        } else if (section === "av") { //Cost for selected AV items
          avItems.forEach((item) => {
            totalCost += item.cost * item.quantity;
          });
        } else if (section === "meals") { //cost for selected meal items
          mealsItems.forEach((item) => {
            if (item.selected) {
              totalCost += item.cost * numberOfPeople;
            }
          });
        }
        return totalCost;
    };

    const venueTotalCost = calculateTotalCost("venue"); //cost for all selected rooms 
    const avTotalCost = calculateTotalCost("av"); //Cost for selected AV items
    const mealsTotalCost = calculateTotalCost("meals"); //cost for selected meal items

    // TOTAL COST TABLE
    const totalCosts = {
      venue: venueTotalCost,
      av: avTotalCost,
      meals: mealsTotalCost,
    };
    
    const getItemsFromTotalCost = () => {
      const items = [];
      venueItems.forEach((item) => {
        if (item.quantity > 0) {
          items.push({...item, type: "venue"});
        }
      });
      avItems.forEach((item) => {
        if (item.quantity > 0 && !items.some((i) => i.name === item.name && i.type === "av")) {
          items.push({...item, type: "av"});
        }
      });
      mealsItems.forEach((item) => {
        if (item.selected) {
          const itemForDisplay = { ...item, type: "meals"};
          if (item.numberOfPeople) {
            itemForDisplay.numberOfPeople = numberOfPeople;
          };
          items.push(itemForDisplay);
        }
      });
      return items;
    };
    
    // TOTAL COST TABLE DISPLAY //ItemsDisplay
    const handleToggleItems = () => {
      console.log("handleToggleItems called");
      setShowItems(!showItems);
    };

    const items = getItemsFromTotalCost();

    const ItemsDisplay = ({ items }) => {
      console.log(items);
      return <>
        <div className="display_box1">
          {items.length === 0 && <p>No items selected</p>}
          <table className="table_item_data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Unit Cost</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td> {item.name} </td>
                  <td> ${item.cost} </td>
                  <td>
                    {item.type === "meals" || item.numberOfPeople ? `Meals for ${numberOfPeople} people` : item.quantity}
                  </td>
                  <td>
                    {item.type === "meals" || item.numberOfPeople ? `${item.cost * numberOfPeople}` : `${item.cost * item.quantity}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
    };

    //NAVBAR NAVIGATION FUNCTION
    const navigateToProducts = (idType) => {
        if (idType == '#venue' || idType == '#addons' || idType == '#meals') {
          if (showItems) { // Check if showItems is false
            setShowItems(!showItems); // Toggle showItems to true only if it's currently false
          }
        }
      }



    return (
        <>
{/* NAVBAR */}
            <nav className="navbar_event_conference">
                <div className="company_logo">BudgetEase +++</div>
                <div className="left_navbar">
                    <div className="nav_links">
                        <a href="#venue" onClick={() => navigateToProducts("#venue")} >Venue</a>
                        <a href="#addons" onClick={() => navigateToProducts('#addons')}>Add-ons</a>
                        <a href="#meals" onClick={() => navigateToProducts('#meals')}>Meals</a>
                    </div>
                    <button className="details_button" onClick={() => setShowItems(!showItems)}>
                        Show Details
                    </button>
                </div>
            </nav>
{/* NAVBAR END*/}

{/* SELECTIONS CONTAINER */}
            <div className="main_container">
                {!showItems
                    ?
                    (
                        <div className="items-information">

  {/* VENUE ROOM SELECTION */}
                             <div id="venue" className="venue_container container_main">
        <div className="text">
 
          <h1>Venue Room Selection</h1>
        </div>
        <div className="venue_selection">
          {venueItems.map((item, index) => (
            <div className="venue_main" key={index}>
              <div className="img">
                <img src={item.img} alt={item.name} />
              </div>
              <div className="text">{item.name}</div>
              <div>${item.cost}</div>
     <div className="button_container">
        {venueItems[index].name === "Auditorium Hall (Capacity:200)" ? (

          <>
          <button
            className={venueItems[index].quantity === 0 ? "btn-warning btn-disabled" : "btn-minus btn-warning"}
            onClick={() => handleRemoveFromCart(index)}
          >
            &#8211;
          </button>
          <span className="selected_count">
            {venueItems[index].quantity > 0 ? ` ${venueItems[index].quantity}` : "0"}
          </span>
          <button
            className={remainingAuditoriumQuantity === 0? "btn-success btn-disabled" : "btn-success btn-plus"}
            onClick={() => handleAddToCart(index)}
          >
            &#43;
          </button>
        </>
        ) : (
          <div className="button_container">
           <button
              className={venueItems[index].quantity ===0 ? " btn-warning btn-disabled" : "btn-warning btn-plus"}
              onClick={() => handleRemoveFromCart(index)}
            >
               &#8211;
            </button>
            <span className="selected_count">
              {venueItems[index].quantity > 0 ? ` ${venueItems[index].quantity}` : "0"}
            </span>
            <button
              className={venueItems[index].quantity === 10 ? " btn-success btn-disabled" : "btn-success btn-plus"}
              onClick={() => handleAddToCart(index)}
            >
             &#43;
            </button>
            
            
          </div>
        )}
      </div>
            </div>
          ))}
        </div>
        <div className="total_cost">Total Cost: ${venueTotalCost}</div>
        {/* displays the total cost of all selected venue items */}
      </div>
{/* VENUE ROOM SELECTION END */}


{/*Necessary Add-ons*/}
            <div id="addons" className="venue_container container_main">
                <div className="text">
                    <h1> Add-ons Selection</h1>
                </div>
                
                <div className="addons_selection">
                  {avItems.map((item, index) => (
                    <div className="av_data venue_main" key={index}>
                      <div className="img">
                          <img src={item.img} alt={item.name} />
                      </div>
                      <div className="text"> {item.name} </div>
                      <div> ${item.cost} </div>
                      <div className="addons_btn">
                          <button className="btn-warning" onClick={() => handleDecrementAvQuantity(index)}> 
                            &ndash; 
                            </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button className=" btn-success" onClick={() => handleIncrementAvQuantity(index)}> 
                            &#43;
                            </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="total_cost">Total Cost: {avTotalCost}</div>
                {/* display the total cost of the selected av items */}
            </div>
{/*SELECTION Add-ons END*/}

{/* Meal Section */}
            <div id="meals" className="venue_container container_main">
              <div className="text">
                  <h1>Meals Selection</h1>
              </div>

              <div className="input-container venue_selection">
                <label htmlFor="numberOfPeople"><h3>Number of People:</h3></label>
                <input type="number" className="input_box5" id="numberOfPeople" 
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
                    min="1"
                />
              </div>

              <div className="meal_selection">
                {mealsItems.map((item, index) => (
                  <div className="meal_item" key={index} style={{ padding: 15 }}>
                    <div className="inner">
                        <input type="checkbox" id={ `meal_${index}` }
                            checked={ item.selected }
                            onChange={() => handleMealSelection(index)}
                        />
                        <label htmlFor={`meal_${index}`}> {item.name} </label>
                    </div>
                    <div className="meal_cost">${item.cost}</div>
                  </div>
                ))}
              </div>
              
              <div className="total_cost">Total Cost: {mealsTotalCost}</div>
              {/* display the total cost of selected meals */}
            </div>
{/* Meal Section END*/}
                        </div>
                    ) : (

// SELECTION DETAILS displayed in a table
                        <div className="total_amount_detail">
                            <TotalCost 
                              totalCosts={totalCosts} handleClick={handleToggleItems} 
                              ItemsDisplay={() => <ItemsDisplay items={items} />} 
                            />
                        </div>
                    )
                }




            </div>
        </>

    );
};

export default ConferenceEvent;
