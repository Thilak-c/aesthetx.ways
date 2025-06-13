"use client"

import BlurText from "@/components/BlurText/BlurText";
import React from 'react'
import ShinyText from '@/components/ShinyText/ShinyText';
  
const handleAnimationComplete = () => {
  console.log('Animation completed!');
};
const page = () => {
  return (
    <div>
<ShinyText text="Just some shiny text!" disabled={false} speed={3} className='custom-class' />
      
<BlurText
  text="Isn't this so cool?!"
  delay={150}
  animateBy="words"
  direction="top"
  onAnimationComplete={handleAnimationComplete}
  className="text-2xl mb-8"
/>
    </div>
  )
}

export default page

