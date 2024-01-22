# Boogey Quest Data Visualization

BoogeyQuest is an educational and interactive project that ventures into the rich world of boogeymen myths from across the globe. It is a fusion of geographical data visualization and storytelling that allows users to discover the diverse folklore associated with these enigmatic figures.



## Dataset Information

## Table of Contents
- [Introduction](#introduction)
- [Dataset Overview](#dataset-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [How to Use](#how-to-use)
- [Acknowledgements](#acknowledgements)
- [References](#references)


## Introduction


Inspired by the comprehensive and intriguing article, "[Nightmare Fuel: Iterations of the Boogeyman in (Almost) Every Country](https://thetoyzone.com/nightmare-fuel-iterations-of-the-boogeyman)," by G. John Cole and Gisele Navarro, this project takes a step further to examine the shared attributes of these mythical entities. The original article and the accompanying map by TheToyZone spotlight the various incarnations of the boogeyman, from the Jersey Devil to the Kuartam, and their roles as harbingers of caution and discipline in local cultures.

As a passionate enthusiast of folklore and myths, I have always been captivated by the universal nature of storytelling and its ability to transcend cultural boundaries. Stories, much like food, are a shared value of humanity, and the narratives surrounding boogeymen have been particularly fascinating to me since my childhood. These tales are more than mere fables; they are a testament to the long-standing oral traditions that have shaped societies and reflected the archetypal fears and values through generations.

This project, BoogeyQuest, seeks to highlight the importance of these tales while providing an interactive and immersive experience into the world of boogeymen, demonstrating how these figures have served as a common thread in the tapestry of global cultural heritage.

This project was created for the course on **Data Visualization** , run by [Isaac Pante](https://github.com/ipante) at the [University of Lausanne](https://www.unil.ch/) (UNIL).

**Author**: _Marcela Havrilova_ (<marcela.havrilova@unil.ch>)
**Date**: _Autumn semester, 2023_

![Screenshot](https://github.com/NoxuuLab/DataIsBeautifull/blob/49c5493d12d5a81cbdfc84b4577f1ad25d457972/images/Screenshot%202024-01-21%20at%2020.03.44.png)


## Dataset Overview

**Origin and Inspiration**

The BoogeyQuest dataset is a compilation of boogeyman stories from various cultures, inspired by a map on TheToyZone website. This dataset extends their work, focusing on unique characteristics and narratives of these mythical entities.

**Significance**

Folk tales, particularly boogeyman stories, are vital in understanding common cultural fears and values. This project aims to highlight universal traits among these figures and their role in different societies.

**Data Collection**

Creating the dataset posed a challenge due to limited structured data on global boogeyman myths. The project began with data from TheToyZone's visualization, which was expanded to include detailed information about each boogeyman. As i didn't have time to make research about the common characteristics by mysself i decided to use GPT to write description of the named boogeymans. 

**Methodology**

To manage the breadth of data, GPT from OpenAI was used to generate detailed descriptions and traits in JSON format.I wrote short script to in OpenAI API to generate the commons descriptions for me. This AI-assisted approach enabled the creation of a rich dataset but also implies that the data may not have undergone thorough cultural verification.

**Dataset Characteristics**
The dataset offers an engaging exploration of boogeymen from around the world, showcasing their varied roles and common themes. It's a mix of folklore and AI-generated content, providing a unique lens on cultural narratives.

## Features

- **Interactive World Map**: A visual representation of the world where countries are highlighted based on the presence of Boogeyman lore.
- **Country Selection**: Users can select a country from a dropdown menu to view information about the Boogeyman associated with that location.
- **Attribute and Behavior Filters**: Dropdown menus allow users to filter the map display based on specific attributes or behaviors of the Boogeymen.
- **Boogeyman Information Card**: Displays detailed information about the selected Boogeyman, including name, country of origin, description, and an image.



## Technologies Used

- **D3.js**: For creating the interactive map and data visualization.
- **GeoJSON**: Geospatial data format used to outline the countries on the map.
- **JavaScript**: The core logic for data handling and UI interactivity.
- **HTML/CSS**: Structure and styling of the web application.

## Project Structure
Dataset : data/boogeyman.json - JSON file containing information about boogeymen in different countries.
Images: illustration of the boogeyman around the world
Files:
- `index.html`: The main HTML file containing the structure of the web page.
- `styles.css`: The CSS file for styling the HTML elements.
- `script.js`: The JavaScript file containing the D3.js code for data visualization.

## How to Use

Explore the Map: Hover over countries to see the name and click to view Boogeyman details.
Select a Country: Use the country dropdown to focus on a specific country's Boogeyman folklore.
Filter by Attribute/Behavior: Use the attribute and behavior dropdowns to highlight countries with Boogeymen matching those characteristics.
Read the Boogeyman Card: After selecting a country or applying filters, read the displayed information about the Boogeyman's lore.


## Acknowledgements

Thanks to [Isaac Pante](https://github.com/ipante) for very inspiring teaching.

## References

**map**  
[https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson](https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson)

**article, dataset, images**
https://thetoyzone.com/nightmare-fuel-iterations-of-the-boogeyman

**openAI API**
https://openai.com/blog/openai-api


