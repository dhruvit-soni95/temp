import mongoose from "mongoose";

const SelectedCommunitiesSchema = new mongoose.Schema({
  selected: {
    type: [String], // store CommunityPage _id values
    default: [],
  },
});

export default mongoose.model(
  "SelectedCommunities",
  SelectedCommunitiesSchema,
  "selected_communities"
);
