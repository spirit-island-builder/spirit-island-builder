export async function onRequest(context) {
  // Cloudflare function.
  // Called from /uploadImage endpoint
  // Relies on IMAGE_CHEST_KEY environment variable
  // logs left in for debugging during integration but can be removed.

  const imageChestKey = context.env.IMAGE_CHEST_KEY;

  console.log(imageChestKey.length);
  console.log("Using Authorization header:", `Bearer ${imageChestKey.substring(0, 5)}...`);

  const incomingFormData = await context.request.formData();
  const imageBlob = incomingFormData.get("image");
  const title = "image.png";

  if (!imageBlob) {
    return new Response(JSON.stringify({ error: "No image data received" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("Received image type:", imageBlob.type);
  console.log("Received image size:", imageBlob.size);

  const imageChestUrl = `https://api.imgchest.com/v1/post`;

  const body = new FormData();
  body.append("title", title);
  body.append("images[]", imageBlob, title || "image.png");

  try {
    const response = await fetch(imageChestUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${imageChestKey}`,
      },
      body: body,
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers));

    const responseText = await response.text();
    console.log("Response body (first characters):", responseText.substring(0, 2000));

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Authentication failed. Please check your API key.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseJson = JSON.parse(responseText);
    console.log("Parsed JSON:", responseJson);
    return new Response(responseJson["data"]["images"][0]["link"], {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
