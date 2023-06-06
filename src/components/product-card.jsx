import * as React from "react"
import { graphql, Link } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"
import { getShopifyImage } from "gatsby-source-shopify"
import { formatPrice } from "../utils/format-price"
import {
  productCardStyle,
  productHeadingStyle,
  productImageStyle,
  productDetailsStyle,
  productVendorStyle,
  productPrice,
} from "./product-card.module.css"

// The ProductCard component receives a 'product' object and an 'eager' flag as props
export function ProductCard({ product, eager }) {
  // Extract the necessary properties from the 'product' object
  const {
    title,
    priceRangeV2,
    slug,
    images: [firstImage],
    vendor,
    storefrontImages,
  } = product

  // Format the price to display
  const price = formatPrice(
    priceRangeV2.minVariantPrice.currencyCode,
    priceRangeV2.minVariantPrice.amount
  )

  // Set default values for the image dimensions
  const defaultImageHeight = 200
  const defaultImageWidth = 200

  // Initialize an empty object to store the storefront image data
  let storefrontImageData = {}

  // Check if there are storefront images available
  if (storefrontImages) {
    // Get the first storefront image (if available) using optional chaining
    let storefrontImage = null;
    if (storefrontImages && storefrontImages.edges && storefrontImages.edges.length > 0) {
      storefrontImage = storefrontImages.edges[0].node;
    }
    try {
      // Generate the Shopify image URL using the 'getShopifyImage' function
      storefrontImageData = getShopifyImage({
        image: storefrontImage,
        layout: "fixed",
        width: defaultImageWidth,
        height: defaultImageHeight,
      })
    } catch (e) {
      console.error(e)
    }
  }

  // Check if the product has an image (either firstImage or storefrontImageData)
  const hasImage = firstImage || Object.getOwnPropertyNames(storefrontImageData || {}).length

  // Render the ProductCard component
  return (
    <Link
      className={productCardStyle}
      to={slug}
      aria-label={`View ${title} product page`}
    >
      {hasImage ? (
        // Render the product image if available
        <div className={productImageStyle} data-name="product-image-box">
          <GatsbyImage
            alt={firstImage?.altText ?? title}
            image={firstImage?.gatsbyImageData ?? storefrontImageData}
            loading={eager ? "eager" : "lazy"}
          />
        </div>
      ) : (
        // Render a placeholder div if no image is available
        <div style={{ height: defaultImageHeight, width: defaultImageWidth }} />
      )}
      <div className={productDetailsStyle}>
        <div className={productVendorStyle}>{vendor}</div>
        <h2 as="h2" className={productHeadingStyle}>
          {title}
        </h2>
        <div className={productPrice}>{price}</div>
      </div>
    </Link>
  )
}

// GraphQL query fragment to fetch the necessary data for the ProductCard component
export const query = graphql`
  fragment ProductCard on ShopifyProduct {
    id
    title
    slug: gatsbyPath(
      filePath: "/products/{ShopifyProduct.productType}/{ShopifyProduct.handle}"
    )
    images {
      id
      altText
      gatsbyImageData(aspectRatio: 1, width: 640)
    }
    priceRangeV2 {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    vendor
  }
`
