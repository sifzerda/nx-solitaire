// src/app/home.js
import Layout from '../components/Layout';
import Image from "next/image";

function Home() {
  return (
    <Layout>
      
      
      {/* 1st Banner Box */}


      {/* 2nd Banner Box with Image */}


      {/* New Section Below Banners */}
      <section className="w-full max-w-screen-xl mx-auto mt-10 px-4 text-white flex gap-4">
        {/* Text Column */}
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">About</h3>

          <h2 id="home">Home</h2>

 

          <p className="text-sm mb-4 font-rubik">
            Horror is a special genre. It is definable by what it does not possess:
            clear plot goals, antagonists, positive themes, tidy resolutions, and happy endings.

            If a reader is left with an overall sense of dread, confusion, bewilderment and upset, according
            to other genres, the story is a failure...
          </p>

 

          <p className="text-sm mb-4 font-rubik">
           Special storytelling rules apply to horror, which are covered in this blog. I hope you find it useful!
          </p>

          <h2 id="blog">Blog</h2>

 

          <h2 id="contact">Contact</h2>
          <p className="text-sm font-rubik">
            Below are key elements often used in horror storytelling to enhance tension and unsettle the audience.
          </p>

        </div>

      </section>

    </Layout>
  );
}

export default Home;




