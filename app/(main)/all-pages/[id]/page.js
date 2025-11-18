"use client";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { SectionEditDialog } from "../components/SectionEditDialog";
import { SubsectionEditDialog } from "../components/SubSectionEditDialog";
import * as Dialog from "@radix-ui/react-dialog";
import SEOForm from "../components/SEOForm";
import RegionStore from "@/store/RegionStore";
import RegionSelecter from "@/common-components/RegionSelecter";
import { useTheme } from "next-themes";
import ThemeToggler from "@/common-components/ThemeToggler";
import { Button } from "@/components/ui/button";
const Page = () => {
  const params = useParams();
  const router = useRouter();
  const [singlePageData, setSinglePageData] = useState(null);
  const [allPages, setAllPages] = useState([]);
  const [showSEOPanel, setShowAddSEOPanel] = useState(false);
  const { theme } = useTheme();
  const getSinglePageData = useCallback(() => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/contents/getPages?pageID=${params?.id}&theme=${theme}`,
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        setSinglePageData(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [params?.id, theme]);

  useEffect(() => {
    if (params?.id) {
      getSinglePageData();
    }
  }, [params?.id, getSinglePageData]);

  return (
    <main className="flex-1  overflow-auto">
      <div className="flex justify-between items-center border-b p-5">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/all-pages")}
            className="text-sm px-4 py-2 "
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-medium ">
            View/Edit - {singlePageData?.name}
          </h1>
        </div>

        <div className="mx-5 flex justify-center items-center gap-4">
          <Button
            className="theme-button"
            onClick={() => {
              setShowAddSEOPanel(true);
            }}
          >
            Update SEO Settings
          </Button>
          <ThemeToggler />
        </div>
      </div>
      <section className="p-6">
        <div className="space-y-6">
          {singlePageData?.sections.map((section, index) => (
            <div
              key={section._id}
              className="border p-5 rounded-md shadow-sm space-y-4"
            >
              <h1 className="text-2xl text-center rounded font-bold border-b pb-5 mb-5">
                Section No:{index + 1}
              </h1>
              <div>
                <h2 className="text-xl font-bold">
                  {section.headline ? section.headline : "N/A"}
                </h2>
                <p className="text-muted-foreground pb-5">
                  {section.subHeadline && section.subHeadline}
                </p>
                {/* {section.section_image && (
                  <img
                    src={section.section_image}
                    alt="section"
                    className="mt-2 h-70 w-70 max-w-md mb-5"
                  />
                )} */}
                <SectionEditDialog
                  section={section}
                  getSinglePageData={getSinglePageData}
                />
              </div>

              {section.subsections && section.subsections.length > 0 && (
                <div className=" mt-4 space-y-4">
                  {section.subsections.map((sub, i) => (
                    <div
                      key={sub._id}
                      className="border p-3 rounded-md space-y-1"
                    >
                      <h3 className="font-bold flex justify-center items-center text-center text-lg border-b border-slate-200 pb-5 mb-5">
                        Section {index + 1}
                        <ArrowRight className="me-4" /> Subsections:{i + 1}
                      </h3>
                      <h4 className="font-medium">
                        {sub.heading ? sub.heading : "N/A"}
                      </h4>
                      {sub.subheading && (
                        <p className="text-sm text-muted-foreground">
                          {sub.subheading && sub.subheading}
                        </p>
                      )}
                      {sub.description && (
                        <p className="text-sm">
                          {sub.description && sub.description}
                        </p>
                      )}
                      {sub.subSection_image && (
                        <img
                          src={sub.subSection_image}
                          alt="sub"
                          className="mt-2 max-w-xs h-40 w-40"
                        />
                      )}
                      <SubsectionEditDialog
                        subsection={sub}
                        selectedLanguage={theme}
                        getSinglePageData={getSinglePageData}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      {/* .............seo panel.......... */}

      <Dialog.Root
        open={showSEOPanel}
        onOpenChange={() => {
          // setBlogFormState({ blogId: null, state: "add" });
          setShowAddSEOPanel(false);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/20 z-40" />

          <Dialog.Content className="fixed right-0 top-0 h-full w-full sm:w-2/5 bg-white border-l shadow-lg z-50 p-6 overflow-y-auto transition-all animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-4 border-b-4 pb-2 border-[#140B49]">
              <div className="flex justify-center items-center gap-2">
                <Dialog.Close
                  className="rounded-full p-1 hover:bg-gray-100 transition"
                  aria-label="Close panel"
                >
                  <span
                    className="w-5 h-5 text-gray-500 hover:text-gray-700 transition"
                    strokeWidth={2.5}
                  >
                    x
                  </span>
                </Dialog.Close>
                <Dialog.Title className="text-lg font-semibold text-black">
                  Edit SEO Settings
                </Dialog.Title>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // setBlogFormState({ blogId: null, state: "add" });
                    setShowAddSEOPanel(false);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
            <SEOForm
              language={theme}
              getSinglePageData={getSinglePageData}
              SEOFormState={{ pageID: params.id, state: "edit" }}
              setShowAddSEOPanel={setShowAddSEOPanel}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
};

export default Page;
