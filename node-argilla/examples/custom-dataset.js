const { ArgillaClient } = require('../');

/**
 * Example script showing how to create a custom dataset
 * for sentiment analysis of product reviews
 */
async function createProductReviewDataset() {
    const client = new ArgillaClient();

    // Define the dataset settings for product review sentiment analysis
    const settings = {
        guidelines: "Analyze the sentiment of product reviews and provide feedback on the review quality.",
        fields: [
            {
                name: "product_name",
                title: "Product Name",
                description: "The name of the product being reviewed",
                type: "text",
                use_markdown: false
            },
            {
                name: "review_text",
                title: "Review Text",
                description: "The product review written by a customer",
                type: "text",
                use_markdown: false
            }
        ],
        questions: [
            {
                name: "sentiment",
                title: "Sentiment",
                description: "What is the sentiment of this review?",
                type: "label",
                labels: ["positive", "neutral", "negative"]
            },
            {
                name: "helpful_score",
                title: "Helpfulness Score",
                description: "How helpful is this review for other customers?",
                type: "rating",
                values: [1, 2, 3, 4, 5]
            },
            {
                name: "review_quality",
                title: "Review Quality",
                description: "Rate the quality and detail level of the review",
                type: "rating",
                values: [1, 2, 3, 4, 5]
            }
        ]
    };

    // Sample product reviews
    const productReviews = [
        {
            product_name: "Wireless Headphones X3",
            review_text: "These are the best headphones I've ever owned. The sound quality is incredible, and the battery life is amazing - lasts all week on a single charge! The noise cancellation works perfectly in noisy environments."
        },
        {
            product_name: "Smart Fitness Watch Pro",
            review_text: "It's okay but not great. The step counter seems accurate, but the heart rate monitor is inconsistent. Battery life is decent - about 3 days. The app needs improvement and crashes occasionally."
        },
        {
            product_name: "Ultra Slim Laptop 5000",
            review_text: "Terrible product! It overheats constantly and the battery barely lasts 2 hours despite the advertised 10 hours. The keyboard started malfunctioning after just 2 weeks. Complete waste of money."
        },
        {
            product_name: "Professional Blender Deluxe",
            review_text: "Works well for smoothies but struggles with tougher ingredients like frozen fruit. The motor is a bit loud but gets the job done. Assembly and cleaning are straightforward."
        },
        {
            product_name: "Wireless Charging Pad",
            review_text: "Doesn't work with my phone case. Had to return it."
        }
    ];

    // Create the dataset
    const dataset_name = "product_reviews";
    const dataset = await client.createOrGetDataset(dataset_name, settings);

    if (!dataset) {
        console.error("Failed to create or get dataset");
        return null;
    }

    // Convert reviews to records
    const records = productReviews.map(review => ({
        fields: {
            product_name: review.product_name,
            review_text: review.review_text
        },
        metadata: {
            source: "example_script",
            category: "electronics" // You can add any metadata fields
        }
    }));

    // Add records to the dataset
    const addedCount = await client.addRecordsToDataset(dataset.id, records);

    console.log(`Added ${addedCount} product review records`);

    return dataset;
}

// Run the example
createProductReviewDataset()
    .then(dataset => {
        if (dataset) {
            console.log(`\nProduct review dataset created with ID: ${dataset.id}`);
            console.log(`Visit ${process.env.ARGILLA_API_URL} to start annotating the product reviews.`);
        }
    })
    .catch(err => {
        console.error('Error creating product review dataset:', err);
    }); 