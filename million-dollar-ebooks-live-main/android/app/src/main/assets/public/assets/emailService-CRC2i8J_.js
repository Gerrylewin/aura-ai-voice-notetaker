import{s as r}from"./index-ehPtbt0R.js";const a=async o=>{try{console.log("Sending email via edge function:",o);const{data:e,error:i}=await r.functions.invoke("send-notification-email",{body:o});if(i)throw console.error("Supabase function invoke error:",i),i;return console.log("Email sent successfully:",e),e}catch(e){throw console.error("Error sending email:",e),e}},s={welcome:(o,e)=>({subject:"Welcome to Million Dollar eBooks!",html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Welcome to Million Dollar eBooks, ${o}!</h1>
        <p>Thank you for joining our community as a ${e}.</p>
        ${e==="writer"?"<p>You can now start publishing your books and earning 90% of every sale!</p>":"<p>Discover amazing books from indie authors for just $1 each, plus free classics!</p>"}
        <p>Get started by exploring our platform and connecting with other book lovers.</p>
        <p>Happy ${e==="writer"?"writing":"reading"}!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `}),writerUpgrade:o=>({subject:"Welcome to the Writer Community!",html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Congratulations, ${o}!</h1>
        <p>Your account has been successfully upgraded to a Writer account.</p>
        <p>You can now:</p>
        <ul>
          <li>Publish your own books</li>
          <li>Earn 90% of every sale</li>
          <li>Access advanced writer tools</li>
          <li>Connect with your readers</li>
        </ul>
        <p>Start your writing journey today and join thousands of successful authors on our platform!</p>
        <p>Happy writing!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `}),moderatorUpgrade:o=>({subject:"Welcome to the Moderation Team!",html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Congratulations, ${o}!</h1>
        <p>Your request to become a moderator has been approved!</p>
        <p>As a moderator, you can now:</p>
        <ul>
          <li>Help review flagged content</li>
          <li>Assist in maintaining community guidelines</li>
          <li>Support other community members</li>
          <li>Access the moderation panel</li>
        </ul>
        <p>Thank you for helping keep our community safe and welcoming!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `}),purchaseConfirmation:(o,e,i)=>({subject:`Purchase Confirmation: ${o}`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Purchase Confirmed!</h1>
        <p>Thank you for purchasing <strong>${o}</strong> by ${e}.</p>
        <p>Amount paid: ${i}</p>
        <p>Your book is now available in your library. You can start reading immediately!</p>
        <p>Thank you for supporting independent authors.</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `}),newReview:(o,e,i)=>({subject:`New Review for "${o}"`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">You received a new review!</h1>
        <p>Someone just reviewed your book <strong>${o}</strong>.</p>
        <p><strong>Rating:</strong> ${e}/5 stars</p>
        ${i?`<p><strong>Review:</strong> "${i}"</p>`:""}
        <p>Keep up the great work!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `}),bookPublished:o=>({subject:`Your book "${o}" is now live!`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Congratulations! Your book is published!</h1>
        <p>Your book <strong>${o}</strong> has been successfully published and is now available to readers worldwide.</p>
        <p>Readers can now discover and purchase your book. You'll earn 90% of every sale!</p>
        <p>Share your book with friends and social media to boost visibility.</p>
        <p>Good luck with your sales!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `}),commentNotification:(o,e,i)=>({subject:`New comment on your ${i}`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">New Comment!</h1>
        <p><strong>${o}</strong> left a comment on your ${i} <strong>"${e}"</strong>.</p>
        <p>Check out what they had to say and join the conversation!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `}),giftNotification:(o,e,i)=>({subject:"You received a book gift!",html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">You've Got a Gift! 🎁</h1>
        <p><strong>${o}</strong> sent you a copy of <strong>"${e}"</strong>!</p>
        ${i?`<p><strong>Message:</strong> "${i}"</p>`:""}
        <p>The book is now available in your library. Happy reading!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `}),messageNotification:o=>({subject:`New message from ${o}`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">New Message!</h1>
        <p>You have a new message from <strong>${o}</strong>.</p>
        <p>Log in to your account to read and reply to their message.</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `}),newBookFromFavorite:(o,e)=>({subject:`New book from ${o}!`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">New Book Alert! 📚</h1>
        <p>Great news! <strong>${o}</strong>, one of your favorite authors, just published a new book:</p>
        <h2 style="color: #dc2626;">"${e}"</h2>
        <p>Check it out now and be among the first to read their latest work!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `}),newStoryFromFavorite:(o,e)=>({subject:`New story from ${o}!`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">New Story Alert! ✨</h1>
        <p><strong>${o}</strong>, one of your favorite authors, just shared a new daily story:</p>
        <h2 style="color: #dc2626;">"${e}"</h2>
        <p>Read it now and show your support with a reaction!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `})};export{s as emailTemplates,a as sendEmail};
