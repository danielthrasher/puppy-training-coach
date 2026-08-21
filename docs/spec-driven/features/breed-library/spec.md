# Breed library feature spec

## Problem

Right now the puppy profile uses freeform breed text. That makes it harder to:

- keep breed names consistent
- offer breed-specific tips
- preload common breed traits
- let users browse likely breeds quickly

## Users

- new puppy owners
- mixed-breed owners who want a starting point
- returning users updating their puppy profile

## Goals

- provide a breed picker instead of freeform breed text only
- show lightweight breed facts after selection
- support a searchable dropdown with common breeds
- allow "mixed breed" or manual override when needed

## Non-goals

- veterinary advice
- guaranteed behavior predictions by breed
- a full kennel-club encyclopedia

## Acceptance criteria

- Users can open a breed dropdown and search by name.
- Users can choose a breed from a curated list or external source.
- The selected breed populates the puppy profile field.
- The app can display at least 3 breed facts after selection.
- Mixed breed / unknown breed remains supported.
