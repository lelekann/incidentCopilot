import { createContext, useContext, useEffect, useState } from "react";
import { getShipments } from "../services/api";

const ShipmentContext = createContext();

export function ShipmentProvider({ children }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadShipments() {
      try {
        const data = await getShipments();
        console.log(data.shipments)
        setShipments(data.shipments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadShipments();
  }, []);

  return (
    <ShipmentContext.Provider
      value={{
        shipments,
        setShipments,
        loading,
        error,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
}

export function useShipments() {
  const context = useContext(ShipmentContext);

  if (!context) {
    throw new Error("useShipments must be used inside ShipmentProvider");
  }

  return context;
}