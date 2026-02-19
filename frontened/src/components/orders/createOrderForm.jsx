import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addOrder } from "../../features/orders/orderSlice";

const CreateOrderForm = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);

  const fleetManagers = users.filter(
    (user) => user.role === "FleetManager"
  );

  const [formData, setFormData] = useState({
    customerName: "",
    pickupLocation: "",
    deliveryLocation: "",
    fleetManagerId: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const newOrder = {
      _id: Date.now().toString(),
      ...formData,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    dispatch(addOrder(newOrder));

    setFormData({
      customerName: "",
      pickupLocation: "",
      deliveryLocation: "",
      fleetManagerId: "",
    });
  };

  return (
    <div>
      <h3>Create Order</h3>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Customer Name"
          value={formData.customerName}
          onChange={(e) =>
            setFormData({ ...formData, customerName: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Pickup Location"
          value={formData.pickupLocation}
          onChange={(e) =>
            setFormData({ ...formData, pickupLocation: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Delivery Location"
          value={formData.deliveryLocation}
          onChange={(e) =>
            setFormData({ ...formData, deliveryLocation: e.target.value })
          }
        />

        <select
          value={formData.fleetManagerId}
          onChange={(e) =>
            setFormData({ ...formData, fleetManagerId: e.target.value })
          }
        >
          <option value="">Select Fleet Manager</option>
          {fleetManagers.map((fm) => (
            <option key={fm._id} value={fm._id}>
              {fm.name}
            </option>
          ))}
        </select>

        <button type="submit">Create Order</button>
      </form>
    </div>
  );
};

export default CreateOrderForm;
