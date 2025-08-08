import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { Link } from "react-router-dom";
import toast from "react-hot-toast";

// NLP
import { parseQuery, applyFilters } from "../ai/nlp";

const Products = () => {
  const [data, setData] = useState([]);
  const [categoryFiltered, setCategoryFiltered] = useState([]); // list after category buttons
  const [loading, setLoading] = useState(false);

  // 🔹 Search: draft vs applied
  const [qDraft, setQDraft] = useState("");
  const [qApplied, setQApplied] = useState(""); // only this affects results

  // parse only the applied query
  const parsed = useMemo(() => parseQuery(qApplied), [qApplied]);
  const visible = useMemo(
    () => applyFilters(categoryFiltered, parsed),
    [categoryFiltered, parsed]
  );

  const dispatch = useDispatch();
  const addProduct = (product) => dispatch(addCart(product));

  useEffect(() => {
    let isMounted = true;
    const getProducts = async () => {
      setLoading(true);
      const res = await fetch("https://fakestoreapi.com/products/");
      const all = await res.json();
      if (isMounted) {
        setData(all);
        setCategoryFiltered(all);
        setLoading(false);
      }
    };
    getProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const Loading = () => (
    <>
      <div className="col-12 py-5 text-center">
        <Skeleton height={40} width={560} />
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
      ))}
    </>
  );

  const filterProduct = (cat) => {
    const updated = data.filter((item) => item.category === cat);
    setCategoryFiltered(updated);
  };

  // 🔹 Submit handler for Search button / Enter key
  const onSearchSubmit = (e) => {
    e.preventDefault();
    setQApplied(qDraft.trim());
  };

  const onClear = () => {
    setQDraft("");
    setQApplied("");
  };

  return (
    <>
      <div className="container my-3 py-3">
        <div className="row">
          <div className="col-12">
            <h2 className="display-5 text-center">Latest Products</h2>
            <hr />
          </div>
        </div>

        {/* 🔹 Search form with button (doesn't remount on typing) */}
        <div className="row mb-3">
          <div className="col-12">
            <form className="d-flex gap-2" onSubmit={onSearchSubmit}>
              <input
                className="form-control"
                placeholder='Try: "women cotton under $50 with good reviews"'
                value={qDraft}
                onChange={(e) => setQDraft(e.target.value)}
              />
              <button type="submit" className="btn btn-dark">
                Search
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={onClear}>
                Clear
              </button>
            </form>

            {/* parsed chips show the APPLIED query */}
            {qApplied && (
              <div className="mt-2" style={{ fontSize: 12, color: "#555" }}>
                {parsed.category && (
                  <span className="badge bg-light text-dark me-2">
                    Category: {parsed.category}
                  </span>
                )}
                {parsed.minPrice != null && (
                  <span className="badge bg-light text-dark me-2">
                    Min: ${parsed.minPrice}
                  </span>
                )}
                {parsed.maxPrice != null && (
                  <span className="badge bg-light text-dark me-2">
                    Max: ${parsed.maxPrice}
                  </span>
                )}
                {parsed.minRating != null && (
                  <span className="badge bg-light text-dark me-2">
                    Rating ≥ {parsed.minRating}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Category buttons */}
        <div className="row">
          <div className="col-12">
            <div className="buttons text-center py-2">
              <button
                className="btn btn-outline-dark btn-sm m-2"
                onClick={() => setCategoryFiltered(data)}
              >
                All
              </button>
              <button
                className="btn btn-outline-dark btn-sm m-2"
                onClick={() => filterProduct("men's clothing")}
              >
                Men's Clothing
              </button>
              <button
                className="btn btn-outline-dark btn-sm m-2"
                onClick={() => filterProduct("women's clothing")}
              >
                Women's Clothing
              </button>
              <button
                className="btn btn-outline-dark btn-sm m-2"
                onClick={() => filterProduct("jewelery")}
              >
                Jewelery
              </button>
              <button
                className="btn btn-outline-dark btn-sm m-2"
                onClick={() => filterProduct("electronics")}
              >
                Electronics
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="row justify-content-center">
          {loading ? (
            <Loading />
          ) : visible.length ? (
            visible.map((product) => (
              <div
                id={product.id}
                key={product.id}
                className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4"
              >
                <div className="card text-center h-100">
                  <img
                    className="card-img-top p-3"
                    src={product.image}
                    alt="Card"
                    height={300}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {product.title.substring(0, 12)}...
                    </h5>
                    <p className="card-text">
                      {product.description.substring(0, 90)}...
                    </p>
                  </div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item lead">$ {product.price}</li>
                  </ul>
                  <div className="card-body">
                    <Link to={"/product/" + product.id} className="btn btn-dark m-1">
                      Buy Now
                    </Link>
                    <button
                      className="btn btn-dark m-1"
                      onClick={() => {
                        toast.success("Added to cart");
                        addProduct(product);
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted text-center py-4">
              No matches — click **Clear** or try a different query.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;
