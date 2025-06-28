import  { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const Portal = ({ children }) => {
  const [portalNode, setPortalNode] = useState(null);

  useEffect(() => {
    // Create a DOM element for the portal
    const node = document.createElement("div");
    document.body.appendChild(node);
    setPortalNode(node);

    // Cleanup on unmount
    return () => {
      document.body.removeChild(node);
    };
  }, []);

  if (!portalNode) return null;

  return ReactDOM.createPortal(children, portalNode);
};

export default Portal;