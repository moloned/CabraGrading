const extractYoutubeId = (url) => {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

console.log('FhwV1BjPYJQ match:', extractYoutubeId('https://www.youtube.com/watch?v=FhwV1BjPYJQ'))
console.log('Short URL match:', extractYoutubeId('https://youtu.be/FhwV1BjPYJQ'))
console.log('With query params:', extractYoutubeId('https://www.youtube.com/watch?v=FhwV1BjPYJQ&t=52s'))
