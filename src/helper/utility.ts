export const emailRegex = (email: any) => {
  let regex = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
  return regex.test(email);
};
export const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
  try {
    const apiKey = "AIzaSyC7Tklodhmw2i3tMfFCDI7toewdROLio7k"; // ⚠️ replace with your actual key
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );
    const json = await response.json();

    if (json.results.length > 0) {
      const addressComponents = json.results[0].address_components;

      const city = addressComponents.find((c: any) =>
        c.types.includes("locality")
      )?.long_name;
      const state = addressComponents.find((c: any) =>
        c.types.includes("administrative_area_level_1")
      )?.long_name;
      const country = addressComponents.find((c: any) =>
        c.types.includes("country")
      )?.long_name;

      return { city, state, country };
    } else {
      console.warn("No address found for these coordinates");
      return { city: "", state: "", country: "" };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return { city: "", state: "", country: "" };
  }
};
export const datingIntentionsFilter = (relationshipPreference: any) => {
  if (relationshipPreference == "longTermPartner") return "Long-term partner";
  if (relationshipPreference == "longTermAndOpenToShort") return "Long-term ,\nOpen to short";
  if (relationshipPreference == "OpenToShortAndlongTerm") return "Short-term,\nopen to long";
  if (relationshipPreference == "openToShort") return "Short-term fun";
  if (relationshipPreference == "friends") return "New friends";
  if (relationshipPreference == "notSure") return "Still figuring it out";
}
