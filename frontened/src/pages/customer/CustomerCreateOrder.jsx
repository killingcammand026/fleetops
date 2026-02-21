import { useNavigate } from "react-router-dom";
import CreateOrderForm from "../../components/orders/CreateOrderForm";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const CustomerCreateOrder = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">

        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Create New Order
            </h1>
            <p className="text-gray-500 mt-1">
              Fill in the details to schedule your delivery
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
          >
             Back
          </button>
        </div>

        {/* Form Card */}
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">
              Order Details
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="max-w-2xl mx-auto">
              <CreateOrderForm />
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default CustomerCreateOrder;