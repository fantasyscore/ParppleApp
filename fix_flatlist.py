filepath = "src/screens/ProfileScreens/ProfileScreenAndroid.tsx"
with open(filepath, "r") as f:
    content = f.read()

content = content.replace(
    'keyExtractor={(item) => item.id.toString()}',
    'keyExtractor={(item) => (item._id || item.id || "").toString()}'
)

with open(filepath, "w") as f:
    f.write(content)
