#!/usr/bin/env python3
import argilla as rg
import json
import sys

def publish_dataset(dataset_id):
    """
    Publish a dataset and add example records to it
    """
    try:
        # Initialize the Argilla client
        rg.init(
            api_url="http://localhost:6900",
            api_key="eN9ip2kfOlAHiuh1_lJF6QjR-2gY-pTWcwOF4odQJbQnm0039XmDrfcn4FXcyJh9Kswyt-LzBTRk44mZbhIa97bnXflkpl8XONomGgB2PBs"
        )
        
        # List available datasets
        datasets = rg.list_datasets()
        print("Available datasets:")
        for dataset in datasets:
            print(f"- {dataset.name} (ID: {dataset.id})")
        
        # Get the dataset with the specified ID
        dataset = None
        for ds in datasets:
            if ds.id == dataset_id:
                dataset = ds
                break
        
        if not dataset:
            print(f"Dataset with ID {dataset_id} not found.")
            return False
            
        print(f"\nWorking with dataset: {dataset.name} (ID: {dataset.id})")
        
        # Example chatbot conversations to add as records
        example_conversations = [
            {
                "user_query": "What is machine learning?",
                "bot_response": "Machine learning is a subset of artificial intelligence that enables computers to learn from data without explicit programming. It uses statistical techniques to improve performance on tasks over time."
            },
            {
                "user_query": "How do I make a chocolate cake?",
                "bot_response": "To make a chocolate cake, you need: 2 cups flour, 1 cup sugar, 1/2 cup cocoa powder, 1 tsp baking soda, 1/2 tsp salt, 2 eggs, 1 cup milk, 1/2 cup oil, 2 tsp vanilla extract. Mix dry ingredients, add wet ingredients, bake at 350°F for 30-35 minutes."
            },
            {
                "user_query": "Can you explain quantum computing?",
                "bot_response": "Quantum computing uses quantum bits or qubits, which can exist in multiple states simultaneously, unlike classical bits. This property allows quantum computers to solve certain problems much faster than traditional computers."
            },
            {
                "user_query": "What's the best way to learn a new language?",
                "bot_response": "Practice daily, use language learning apps, watch movies in that language, find a conversation partner, and immerse yourself in the culture."
            }
        ]
        
        # Attempt to add records to the dataset
        try:
            # Format records for adding to the dataset
            records = []
            for conv in example_conversations:
                records.append(
                    rg.FeedbackRecord(
                        fields={
                            "user_query": conv["user_query"],
                            "bot_response": conv["bot_response"]
                        },
                        metadata={"source": "python_script"}
                    )
                )
            
            # Add records to the dataset
            print(f"Adding {len(records)} records to the dataset...")
            dataset.add_records(records)
            print("Records added successfully.")
        except Exception as e:
            print(f"Error adding records: {str(e)}")
            print("The dataset may not be published or may have other issues.")
            print("Check the Argilla UI to publish the dataset.")
        
        print(f"\nDataset is ready for annotation! Visit http://localhost:6900 to start rating and providing feedback.")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 publish_dataset.py <dataset_id>")
        sys.exit(1)
    
    dataset_id = sys.argv[1]
    success = publish_dataset(dataset_id)
    sys.exit(0 if success else 1) 